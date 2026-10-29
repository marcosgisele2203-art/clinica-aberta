"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { criarSessao, type Papel } from "./session";
import { emailValido } from "./domain";

export type EstadoAuth = { erro?: string };

function destinoDoPapel(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "MEDICO") return "/medico";
  return "/buscar";
}

export async function entrar(_anterior: EstadoAuth, dados: FormData): Promise<EstadoAuth> {
  const email = String(dados.get("email") ?? "").trim().toLowerCase();
  const senha = String(dados.get("senha") ?? "");
  if (!email || !senha) return { erro: "Preencha e-mail e senha." };

  const usuario = await db.user.findUnique({ where: { email } });
  if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
    return { erro: "E-mail ou senha incorretos." };
  }

  await criarSessao({ uid: usuario.id, role: usuario.role as Papel, nome: usuario.nome });
  redirect(destinoDoPapel(usuario.role));
}

export async function criarConta(_anterior: EstadoAuth, dados: FormData): Promise<EstadoAuth> {
  const nome = String(dados.get("nome") ?? "").trim();
  const email = String(dados.get("email") ?? "").trim().toLowerCase();
  const telefone = String(dados.get("telefone") ?? "").trim();
  const senha = String(dados.get("senha") ?? "");
  const papel = String(dados.get("papel") ?? "PACIENTE") === "MEDICO" ? "MEDICO" : "PACIENTE";

  if (nome.length < 3) return { erro: "Informe seu nome completo." };
  if (!emailValido(email)) return { erro: "Esse e-mail não parece válido." };
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };

  const jaExiste = await db.user.findUnique({ where: { email } });
  if (jaExiste) return { erro: "Já existe uma conta com esse e-mail. Tente entrar." };

  const usuario = await db.user.create({
    data: { nome, email, telefone: telefone || null, senhaHash: await bcrypt.hash(senha, 10), role: papel },
  });

  await criarSessao({ uid: usuario.id, role: papel as Papel, nome: usuario.nome });
  redirect(papel === "MEDICO" ? "/medico/cadastro" : "/buscar");
}
