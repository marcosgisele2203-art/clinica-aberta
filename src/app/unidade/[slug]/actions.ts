"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sessaoAtual } from "@/lib/session";
import { diaDaSemana, gerarProtocolo, hoje } from "@/lib/domain";

export type EstadoAgendamento = {
  erro?: string;
  precisaEntrar?: boolean;
  ok?: { protocolo: string; data: string; turno: string; unidade: string; especialidade: string };
};

const ATIVOS = ["CONFIRMADO", "COMPARECEU"];

export async function agendar(
  _anterior: EstadoAgendamento,
  dados: FormData
): Promise<EstadoAgendamento> {
  const slug = String(dados.get("slug") ?? "");
  const especialidade = String(dados.get("especialidade") ?? "");
  const data = String(dados.get("data") ?? "");
  const turno = String(dados.get("turno") ?? "");
  const observacao = String(dados.get("observacao") ?? "").trim().slice(0, 300);

  const sessao = await sessaoAtual();
  if (!sessao || sessao.role !== "CIDADAO") {
    return { precisaEntrar: true, erro: "Entre com seu CPF para confirmar o agendamento." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return { erro: "Data inválida." };
  if (data <= hoje()) return { erro: "O agendamento é sempre para um dia seguinte em diante." };

  const unidade = await db.unidade.findUnique({ where: { slug } });
  if (!unidade || !unidade.ativa) return { erro: "Esta unidade não está disponível." };

  try {
    const protocolo = await db.$transaction(
      async (tx) => {
        const disponibilidade = await tx.disponibilidade.findFirst({
          where: {
            unidadeId: unidade.id,
            especialidade,
            diaSemana: diaDaSemana(data),
            turno,
            ativa: true,
          },
        });
        if (!disponibilidade) throw new Error("SEM_ATENDIMENTO");

        const bloqueio = await tx.bloqueio.findFirst({
          where: { unidadeId: unidade.id, data },
        });
        if (bloqueio) throw new Error("BLOQUEADO");

        const jaMarcou = await tx.agendamento.findFirst({
          where: {
            cidadaoId: sessao.uid,
            especialidade,
            status: "CONFIRMADO",
            data: { gte: hoje() },
          },
        });
        if (jaMarcou) throw new Error("JA_MARCOU");

        const ocupadas = await tx.agendamento.count({
          where: {
            unidadeId: unidade.id,
            especialidade,
            data,
            turno,
            status: { in: ATIVOS },
          },
        });
        if (ocupadas >= disponibilidade.vagas) throw new Error("SEM_VAGA");

        const criado = await tx.agendamento.create({
          data: {
            protocolo: gerarProtocolo(),
            unidadeId: unidade.id,
            cidadaoId: sessao.uid,
            especialidade,
            data,
            turno,
            observacao,
            status: "CONFIRMADO",
          },
        });
        return criado.protocolo;
      },
      { isolationLevel: "Serializable" }
    );

    revalidatePath(`/unidade/${slug}`);
    revalidatePath("/meus-agendamentos");
    revalidatePath("/secretaria");
    return { ok: { protocolo, data, turno, unidade: unidade.nome, especialidade } };
  } catch (e) {
    const motivo = (e as Error).message;
    if (motivo === "SEM_ATENDIMENTO") return { erro: "Esta unidade não atende essa especialidade nesse dia." };
    if (motivo === "BLOQUEADO") return { erro: "A unidade está fechada nesse dia. Escolha outra data." };
    if (motivo === "SEM_VAGA") return { erro: "As vagas desse turno acabaram agora. Escolha outro dia ou turno." };
    if (motivo === "JA_MARCOU") {
      return { erro: "Você já tem um agendamento futuro para essa especialidade. Cancele o anterior antes de marcar outro." };
    }
    // Conflito de escrita simultânea no Postgres: duas pessoas pegando a última vaga.
    return { erro: "Não consegui confirmar agora. Tente de novo em alguns segundos." };
  }
}
