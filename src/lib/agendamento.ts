import type { PrismaClient } from "@prisma/client";
import { diaDaSemana, gerarProtocolo, hoje } from "./domain";

/** Status que ocupam vaga. */
export const ATIVOS = ["CONFIRMADO", "COMPARECEU"];

export type PedidoDeVaga = {
  unidadeId: string;
  cidadaoId: string;
  especialidade: string;
  data: string; // AAAA-MM-DD
  turno: string; // MANHA | TARDE
  observacao: string;
};

/**
 * Reserva a vaga dentro de uma transação Serializable e devolve o protocolo.
 * Se duas pessoas pegarem a última vaga ao mesmo tempo, só uma confirma: a outra recebe
 * SEM_VAGA ou um erro de conflito do Postgres, e nada é gravado para ela.
 * Erros de regra saem como Error com a mensagem SEM_ATENDIMENTO, BLOQUEADO, JA_MARCOU ou SEM_VAGA.
 */
export async function reservarVaga(cliente: PrismaClient, pedido: PedidoDeVaga): Promise<string> {
  const { unidadeId, cidadaoId, especialidade, data, turno, observacao } = pedido;
  return cliente.$transaction(
    async (tx) => {
      const disponibilidade = await tx.disponibilidade.findFirst({
        where: { unidadeId, especialidade, diaSemana: diaDaSemana(data), turno, ativa: true },
      });
      if (!disponibilidade) throw new Error("SEM_ATENDIMENTO");

      const bloqueio = await tx.bloqueio.findFirst({ where: { unidadeId, data } });
      if (bloqueio) throw new Error("BLOQUEADO");

      const jaMarcou = await tx.agendamento.findFirst({
        where: { cidadaoId, especialidade, status: "CONFIRMADO", data: { gte: hoje() } },
      });
      if (jaMarcou) throw new Error("JA_MARCOU");

      const ocupadas = await tx.agendamento.count({
        where: { unidadeId, especialidade, data, turno, status: { in: ATIVOS } },
      });
      if (ocupadas >= disponibilidade.vagas) throw new Error("SEM_VAGA");

      const criado = await tx.agendamento.create({
        data: {
          protocolo: gerarProtocolo(),
          unidadeId,
          cidadaoId,
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
}
