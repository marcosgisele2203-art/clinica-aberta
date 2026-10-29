"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { exigirPapel } from "@/lib/session";
import { CONVENIOS, ESPECIALIDADES, PLANOS, UFS, apenasNumeros, gerarSlug } from "@/lib/domain";

export type EstadoCadastro = { erro?: string };

/** Garante um slug livre: dra-helena-fontes, dra-helena-fontes-2, … */
async function slugLivre(nome: string) {
  const base = gerarSlug(nome) || "clinica";
  let tentativa = base;
  let n = 1;
  while (await db.medico.findUnique({ where: { slug: tentativa } })) {
    n += 1;
    tentativa = `${base}-${n}`;
  }
  return tentativa;
}

export async function cadastrarClinica(
  _anterior: EstadoCadastro,
  dados: FormData
): Promise<EstadoCadastro> {
  const usuario = await exigirPapel(["MEDICO"]);
  if (usuario.medico) redirect("/medico");

  const texto = (campo: string) => String(dados.get(campo) ?? "").trim();
  const numero = (campo: string, padrao: number) => {
    const n = Number(dados.get(campo));
    return Number.isFinite(n) ? n : padrao;
  };

  const crm = apenasNumeros(texto("crm"));
  const crmUf = texto("crmUf").toUpperCase();
  const especialidade = texto("especialidade");
  const clinica = texto("clinica");
  const cidade = texto("cidade");
  const uf = texto("uf").toUpperCase() || crmUf;

  const diasSemana = dados
    .getAll("diasSemana")
    .map((d) => Number(d))
    .filter((d) => d >= 0 && d <= 6)
    .sort((a, b) => a - b)
    .join(",");

  const convenios = dados
    .getAll("convenios")
    .map((c) => String(c))
    .filter((c) => CONVENIOS.includes(c));

  const horaInicio = numero("horaInicio", 8);
  const horaFim = numero("horaFim", 18);
  const duracaoMin = numero("duracaoMin", 30);
  const valorReais = numero("valor", 0);

  if (crm.length < 3) return { erro: "Informe o número do CRM." };
  if (!UFS.includes(crmUf)) return { erro: "Escolha a UF do CRM." };
  if (!ESPECIALIDADES.includes(especialidade)) return { erro: "Escolha a especialidade." };
  if (clinica.length < 3) return { erro: "Informe o nome da clínica." };
  if (!texto("endereco")) return { erro: "Informe o endereço da clínica." };
  if (!cidade) return { erro: "Informe a cidade." };
  if (!diasSemana) return { erro: "Escolha pelo menos um dia de atendimento." };
  if (horaFim <= horaInicio) return { erro: "O horário final precisa ser depois do inicial." };
  if (!convenios.length) return { erro: "Marque ao menos um convênio ou Particular." };

  const plano = PLANOS.some((p) => p.nome === texto("plano")) ? texto("plano") : "Profissional";

  await db.medico.create({
    data: {
      userId: usuario.id,
      crm,
      crmUf,
      especialidade,
      bio: texto("bio"),
      clinica,
      slug: await slugLivre(usuario.nome),
      cep: texto("cep"),
      endereco: texto("endereco"),
      bairro: texto("bairro"),
      cidade,
      uf,
      diasSemana,
      horaInicio,
      horaFim,
      duracaoMin,
      valorCentavos: Math.max(0, Math.round(valorReais * 100)),
      convenios: convenios.join(","),
      plano,
      status: "PENDENTE",
    },
  });

  revalidatePath("/admin");
  redirect("/medico?enviado=1");
}

export async function cancelarConsulta(dados: FormData) {
  const usuario = await exigirPapel(["MEDICO"]);
  const id = String(dados.get("id") ?? "");
  const consulta = await db.consulta.findUnique({ where: { id } });
  if (!consulta || !usuario.medico || consulta.medicoId !== usuario.medico.id) return;

  await db.consulta.update({ where: { id }, data: { status: "CANCELADA" } });
  revalidatePath("/medico");
  revalidatePath(`/clinica/${usuario.medico.slug}`);
}
