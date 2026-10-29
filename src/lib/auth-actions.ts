"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { criarSessao, type Papel } from "./session";
import { apenasNumeros, cnsAceitavel, cpfValido, idade } from "./domain";

export type EstadoAuth = { erro?: string };

function destinoDoPapel(role: string) {
  return role === "SECRETARIA" ? "/secretaria" : "/meus-agendamentos";
}

export async function entrar(_anterior: EstadoAuth, dados: FormData): Promise<EstadoAuth> {
  const cpf = apenasNumeros(String(dados.get("cpf") ?? ""));
  const senha = String(dados.get("senha") ?? "");
  const proximo = String(dados.get("proximo") ?? "");

  if (!cpf || !senha) return { erro: "Preencha o CPF e a senha." };

  const usuario = await db.usuario.findUnique({ where: { cpf } });
  if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
    return { erro: "CPF ou senha incorretos." };
  }

  await criarSessao({ uid: usuario.id, role: usuario.role as Papel, nome: usuario.nome });
  redirect(proximo || destinoDoPapel(usuario.role));
}

export async function criarConta(_anterior: EstadoAuth, dados: FormData): Promise<EstadoAuth> {
  const nome = String(dados.get("nome") ?? "").trim();
  const cpf = apenasNumeros(String(dados.get("cpf") ?? ""));
  const cns = apenasNumeros(String(dados.get("cns") ?? ""));
  const nascimento = String(dados.get("nascimento") ?? "");
  const telefone = String(dados.get("telefone") ?? "").trim();
  const senha = String(dados.get("senha") ?? "");
  const proximo = String(dados.get("proximo") ?? "");

  if (nome.trim().split(/\s+/).length < 2) return { erro: "Escreva o nome completo, como está no documento." };
  if (!cpfValido(cpf)) return { erro: "Esse CPF não é válido. Confira os números." };
  if (!nascimento || !/^\d{4}-\d{2}-\d{2}$/.test(nascimento)) {
    return { erro: "Informe a data de nascimento." };
  }
  const anos = idade(nascimento);
  if (anos < 0 || anos > 120) return { erro: "A data de nascimento não parece correta." };
  if (!cnsAceitavel(cns)) return { erro: "O cartão SUS tem 15 números. Deixe em branco se não souber." };
  if (senha.length < 6) return { erro: "A senha precisa ter pelo menos 6 caracteres." };

  const jaExiste = await db.usuario.findUnique({ where: { cpf } });
  if (jaExiste) return { erro: "Já existe cadastro com esse CPF. Use a tela de entrar." };

  const usuario = await db.usuario.create({
    data: {
      nome,
      cpf,
      cns: cns || null,
      nascimento,
      telefone: telefone || null,
      senhaHash: await bcrypt.hash(senha, 10),
      role: "CIDADAO",
    },
  });

  await criarSessao({ uid: usuario.id, role: "CIDADAO", nome: usuario.nome });
  redirect(proximo || "/unidades");
}
