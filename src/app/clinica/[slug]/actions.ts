"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sessaoAtual } from "@/lib/session";
import { horariosDoDia, jaPassou, listaDeDias } from "@/lib/domain";

export type EstadoAgendamento = { erro?: string; ok?: { data: string; hora: string } };

export async function agendar(
  _anterior: EstadoAgendamento,
  dados: FormData
): Promise<EstadoAgendamento> {
  const slug = String(dados.get("slug") ?? "");
  const data = String(dados.get("data") ?? "");
  const hora = String(dados.get("hora") ?? "");
  const nome = String(dados.get("nome") ?? "").trim();
  const telefone = String(dados.get("telefone") ?? "").trim();
  const convenio = String(dados.get("convenio") ?? "Particular");
  const motivo = String(dados.get("motivo") ?? "").trim();

  if (!nome || nome.length < 3) return { erro: "Informe o nome completo do paciente." };
  if (telefone.replace(/\D/g, "").length < 10) return { erro: "Informe um telefone com DDD." };

  const medico = await db.medico.findUnique({ where: { slug } });
  if (!medico || medico.status !== "APROVADO") return { erro: "Esta clínica não está disponível." };

  // O horário precisa existir na agenda do médico, não só vir do formulário.
  const diaDaSemana = new Date(`${data}T12:00:00`).getDay();
  const atendeNesseDia = listaDeDias(medico.diasSemana).includes(diaDaSemana);
  const horarios = horariosDoDia(medico.horaInicio, medico.horaFim, medico.duracaoMin);
  if (!atendeNesseDia || !horarios.includes(hora)) {
    return { erro: "Esse horário não faz parte da agenda do médico." };
  }
  if (jaPassou(data, hora)) return { erro: "Esse horário já passou. Escolha outro." };

  const sessao = await sessaoAtual();

  try {
    await db.consulta.create({
      data: {
        medicoId: medico.id,
        pacienteId: sessao?.role === "PACIENTE" ? sessao.uid : null,
        nome,
        telefone,
        convenio,
        motivo,
        data,
        hora,
        status: "CONFIRMADA",
      },
    });
  } catch {
    // Violação do índice único (medicoId, data, hora): alguém marcou primeiro.
    return { erro: "Alguém marcou esse horário agora há pouco. Escolha outro." };
  }

  revalidatePath(`/clinica/${slug}`);
  revalidatePath("/medico");
  return { ok: { data, hora } };
}
