"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { exigirPapel } from "@/lib/session";
import { ESPECIALIDADES, TIPOS_UNIDADE, UFS, gerarSlug, hoje } from "@/lib/domain";

export type EstadoUnidade = { erro?: string };

async function slugLivre(nome: string) {
  const base = gerarSlug(nome) || "unidade";
  let tentativa = base;
  let n = 1;
  while (await db.unidade.findUnique({ where: { slug: tentativa } })) {
    n += 1;
    tentativa = `${base}-${n}`;
  }
  return tentativa;
}

export async function criarUnidade(
  _anterior: EstadoUnidade,
  dados: FormData
): Promise<EstadoUnidade> {
  await exigirPapel(["SECRETARIA"], "/secretaria/unidades");

  const texto = (campo: string) => String(dados.get(campo) ?? "").trim();
  const nome = texto("nome");
  const tipo = TIPOS_UNIDADE.includes(texto("tipo")) ? texto("tipo") : "UBS";
  const uf = texto("uf").toUpperCase();

  if (nome.length < 3) return { erro: "Informe o nome da unidade." };
  if (!texto("endereco")) return { erro: "Informe o endereço." };
  if (!texto("bairro")) return { erro: "Informe o bairro." };
  if (!texto("cidade")) return { erro: "Informe a cidade." };
  if (!UFS.includes(uf)) return { erro: "Escolha a UF." };

  const unidade = await db.unidade.create({
    data: {
      nome,
      slug: await slugLivre(nome),
      tipo,
      endereco: texto("endereco"),
      bairro: texto("bairro"),
      cidade: texto("cidade"),
      uf,
      telefone: texto("telefone") || null,
      funcionamento: texto("funcionamento") || "Segunda a sexta, das 7h às 17h",
      observacao: texto("observacao"),
      ativa: true,
    },
  });

  revalidatePath("/secretaria/unidades");
  revalidatePath("/unidades");
  redirect(`/secretaria/unidades/${unidade.id}`);
}

export async function alternarUnidade(dados: FormData) {
  await exigirPapel(["SECRETARIA"], "/secretaria/unidades");
  const id = String(dados.get("id") ?? "");
  const unidade = await db.unidade.findUnique({ where: { id } });
  if (!unidade) return;

  await db.unidade.update({ where: { id }, data: { ativa: !unidade.ativa } });
  revalidatePath("/secretaria/unidades");
  revalidatePath("/unidades");
  revalidatePath(`/unidade/${unidade.slug}`);
}

export async function salvarDisponibilidade(dados: FormData) {
  await exigirPapel(["SECRETARIA"], "/secretaria/unidades");

  const unidadeId = String(dados.get("unidadeId") ?? "");
  const especialidade = String(dados.get("especialidade") ?? "");
  const turno = String(dados.get("turno") ?? "MANHA");
  const vagas = Math.max(0, Math.min(500, Number(dados.get("vagas") ?? 10)));
  const dias = dados.getAll("dias").map((d) => Number(d)).filter((d) => d >= 0 && d <= 6);

  if (!ESPECIALIDADES.includes(especialidade) || !dias.length) return;

  for (const diaSemana of dias) {
    await db.disponibilidade.upsert({
      where: {
        unidadeId_especialidade_diaSemana_turno: { unidadeId, especialidade, diaSemana, turno },
      },
      update: { vagas, ativa: vagas > 0 },
      create: { unidadeId, especialidade, diaSemana, turno, vagas, ativa: vagas > 0 },
    });
  }

  const unidade = await db.unidade.findUnique({ where: { id: unidadeId } });
  revalidatePath(`/secretaria/unidades/${unidadeId}`);
  revalidatePath("/unidades");
  if (unidade) revalidatePath(`/unidade/${unidade.slug}`);
}

export async function removerDisponibilidade(dados: FormData) {
  await exigirPapel(["SECRETARIA"], "/secretaria/unidades");
  const id = String(dados.get("id") ?? "");
  const disponibilidade = await db.disponibilidade.findUnique({ where: { id } });
  if (!disponibilidade) return;

  await db.disponibilidade.delete({ where: { id } });

  const unidade = await db.unidade.findUnique({ where: { id: disponibilidade.unidadeId } });
  revalidatePath(`/secretaria/unidades/${disponibilidade.unidadeId}`);
  if (unidade) revalidatePath(`/unidade/${unidade.slug}`);
}

export async function criarBloqueio(dados: FormData) {
  await exigirPapel(["SECRETARIA"], "/secretaria/unidades");

  const unidadeId = String(dados.get("unidadeId") ?? "");
  const data = String(dados.get("data") ?? "");
  const motivo = String(dados.get("motivo") ?? "").trim() || "Unidade fechada";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data < hoje()) return;

  await db.bloqueio.upsert({
    where: { unidadeId_data: { unidadeId, data } },
    update: { motivo },
    create: { unidadeId, data, motivo },
  });

  const unidade = await db.unidade.findUnique({ where: { id: unidadeId } });
  revalidatePath(`/secretaria/unidades/${unidadeId}`);
  if (unidade) revalidatePath(`/unidade/${unidade.slug}`);
}

export async function removerBloqueio(dados: FormData) {
  await exigirPapel(["SECRETARIA"], "/secretaria/unidades");
  const id = String(dados.get("id") ?? "");
  const bloqueio = await db.bloqueio.findUnique({ where: { id } });
  if (!bloqueio) return;

  await db.bloqueio.delete({ where: { id } });
  revalidatePath(`/secretaria/unidades/${bloqueio.unidadeId}`);
}

export async function marcarPresenca(dados: FormData) {
  await exigirPapel(["SECRETARIA"], "/secretaria/agenda");
  const id = String(dados.get("id") ?? "");
  const status = String(dados.get("status") ?? "");
  if (!["COMPARECEU", "FALTOU", "CANCELADO", "CONFIRMADO"].includes(status)) return;

  await db.agendamento.update({ where: { id }, data: { status } });
  revalidatePath("/secretaria/agenda");
  revalidatePath("/secretaria");
}
