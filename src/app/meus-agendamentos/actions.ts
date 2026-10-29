"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { exigirPapel } from "@/lib/session";
import { hoje } from "@/lib/domain";

export async function cancelarAgendamento(dados: FormData) {
  const usuario = await exigirPapel(["CIDADAO"], "/meus-agendamentos");
  const id = String(dados.get("id") ?? "");

  const agendamento = await db.agendamento.findUnique({ where: { id } });
  if (!agendamento || agendamento.cidadaoId !== usuario.id) return;
  if (agendamento.status !== "CONFIRMADO") return;
  if (agendamento.data < hoje()) return;

  await db.agendamento.update({ where: { id }, data: { status: "CANCELADO" } });

  revalidatePath("/meus-agendamentos");
  revalidatePath("/secretaria");
}
