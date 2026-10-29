"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { SQL_CRIAR_TABELAS } from "@/lib/schema-sql";
import { SENHA_EXEMPLO, popularBanco } from "@/lib/dados-exemplo";

export type EstadoInstalacao = { erro?: string; pronto?: { unidades: number; senha: string } };

/**
 * Cria as tabelas e popula o banco a partir do navegador, para quem sobe o projeto
 * numa hospedagem sem rodar `prisma db push` num terminal.
 *
 * Só funciona com a senha de instalação (SETUP_TOKEN) e enquanto o banco estiver vazio.
 */
export async function instalar(
  _anterior: EstadoInstalacao,
  dados: FormData
): Promise<EstadoInstalacao> {
  const token = process.env.SETUP_TOKEN;
  if (!token) {
    return { erro: "Defina a variável SETUP_TOKEN no ambiente antes de instalar." };
  }
  if (String(dados.get("token") ?? "") !== token) {
    return { erro: "Senha de instalação incorreta." };
  }

  try {
    for (const instrucao of SQL_CRIAR_TABELAS) {
      await db.$executeRawUnsafe(instrucao);
    }
  } catch (e) {
    return { erro: `Não consegui criar as tabelas: ${(e as Error).message}` };
  }

  const jaTemGente = await db.usuario.count();
  if (jaTemGente > 0) {
    return {
      erro: "O banco já tem dados. Tabelas conferidas, mas não vou sobrescrever o que já existe.",
    };
  }

  try {
    const r = await popularBanco(db);
    revalidatePath("/");
    revalidatePath("/unidades");
    return { pronto: { unidades: r.unidades, senha: SENHA_EXEMPLO } };
  } catch (e) {
    return { erro: `Tabelas criadas, mas falhei ao popular: ${(e as Error).message}` };
  }
}
