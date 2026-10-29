"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { exigirPapel } from "@/lib/session";

async function mudarStatus(id: string, status: string, motivo?: string) {
  await exigirPapel(["ADMIN"]);
  const medico = await db.medico.findUnique({ where: { id } });
  if (!medico) return;

  await db.medico.update({
    where: { id },
    data: {
      status,
      motivoRecusa: motivo ?? null,
      publicadoEm: status === "APROVADO" ? (medico.publicadoEm ?? new Date()) : medico.publicadoEm,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/buscar");
  revalidatePath("/");
  revalidatePath(`/clinica/${medico.slug}`);
}

export async function aprovarClinica(dados: FormData) {
  await mudarStatus(String(dados.get("id") ?? ""), "APROVADO");
}

export async function recusarClinica(dados: FormData) {
  await mudarStatus(
    String(dados.get("id") ?? ""),
    "RECUSADO",
    String(dados.get("motivo") ?? "Dados não conferem com o registro no CRM.")
  );
}

export async function suspenderClinica(dados: FormData) {
  await mudarStatus(String(dados.get("id") ?? ""), "SUSPENSO", "Suspensa pela equipe.");
}

export async function reativarClinica(dados: FormData) {
  await mudarStatus(String(dados.get("id") ?? ""), "APROVADO");
}
