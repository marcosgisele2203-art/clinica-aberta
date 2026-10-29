import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { diaDaSemana, gerarProtocolo, iso, proximosDias } from "./domain";

export const SENHA_EXEMPLO = "senha123";
export const CPF_SECRETARIA = "11144477735"; // CPF de teste, válido nos dígitos verificadores
export const CPF_CIDADAO = "52998224725";

type UnidadeSemente = {
  nome: string;
  slug: string;
  tipo: string;
  endereco: string;
  bairro: string;
  telefone: string;
  funcionamento: string;
  observacao: string;
  /** [especialidade, dias da semana, turnos, vagas] */
  oferta: [string, number[], string[], number][];
};

export const CIDADE = "Miranda";
export const UF = "MS";

export const UNIDADES_EXEMPLO: UnidadeSemente[] = [
  {
    nome: "UBS Centro",
    slug: "ubs-centro",
    tipo: "UBS",
    endereco: "Rua Barão do Rio Branco, 412",
    bairro: "Centro",
    telefone: "(67) 3242-1100",
    funcionamento: "Segunda a sexta, das 7h às 17h",
    observacao: "Traga documento com foto e o cartão SUS. Jejum de 8 horas para a coleta de exames.",
    oferta: [
      ["Clínico Geral", [1, 2, 3, 4, 5], ["MANHA", "TARDE"], 18],
      ["Pediatria", [2, 4], ["MANHA"], 12],
      ["Ginecologia e Pré-natal", [3], ["TARDE"], 10],
      ["Odontologia", [1, 3, 5], ["TARDE"], 8],
      ["Vacinação", [1, 2, 3, 4, 5], ["MANHA", "TARDE"], 40],
      ["Coleta de exames", [2, 4], ["MANHA"], 25],
    ],
  },
  {
    nome: "UBS Vila Nova",
    slug: "ubs-vila-nova",
    tipo: "ESF",
    endereco: "Rua Projetada A, 77",
    bairro: "Vila Nova",
    telefone: "(67) 3242-1180",
    funcionamento: "Segunda a sexta, das 7h às 16h",
    observacao: "Equipe de saúde da família. Visita domiciliar às sextas à tarde.",
    oferta: [
      ["Clínico Geral", [1, 2, 3, 4, 5], ["MANHA"], 15],
      ["Enfermagem", [1, 2, 3, 4, 5], ["MANHA", "TARDE"], 20],
      ["Vacinação", [1, 3, 5], ["MANHA"], 30],
      ["Pediatria", [3], ["TARDE"], 10],
    ],
  },
  {
    nome: "Unidade Mista de Saúde",
    slug: "unidade-mista",
    tipo: "Unidade Mista",
    endereco: "Avenida Afonso Pena, 1500",
    bairro: "Santa Luzia",
    telefone: "(67) 3242-1255",
    funcionamento: "Todos os dias, 24 horas (agendamento só para consultas eletivas)",
    observacao: "O pronto atendimento é por ordem de chegada e não entra no agendamento.",
    oferta: [
      ["Clínico Geral", [1, 2, 3, 4, 5], ["MANHA", "TARDE"], 22],
      ["Ginecologia e Pré-natal", [2, 4], ["MANHA"], 14],
      ["Coleta de exames", [1, 2, 3, 4, 5], ["MANHA"], 35],
      ["Fisioterapia", [1, 3, 5], ["TARDE"], 12],
    ],
  },
  {
    nome: "Centro de Especialidades",
    slug: "centro-especialidades",
    tipo: "Centro de Especialidades",
    endereco: "Rua Dom Aquino, 230",
    bairro: "Centro",
    telefone: "(67) 3242-1310",
    funcionamento: "Segunda a sexta, das 7h às 13h",
    observacao: "Atendimento mediante encaminhamento da unidade de origem.",
    oferta: [
      ["Odontologia", [1, 2, 3, 4, 5], ["MANHA"], 14],
      ["Psicologia", [2, 4], ["MANHA"], 8],
      ["Nutrição", [3], ["MANHA"], 10],
      ["Fisioterapia", [1, 2, 3, 4, 5], ["MANHA"], 16],
    ],
  },
];

const CIDADAOS_EXEMPLO = [
  { nome: "Ana Lúcia Prado", cpf: CPF_CIDADAO, cns: "700500000000001", nascimento: "1986-04-12", telefone: "(67) 99902-1144" },
  { nome: "Sebastião Reis", cpf: "16899535009", cns: "700500000000002", nascimento: "1954-09-03", telefone: "(67) 99814-7720" },
  { nome: "Dulce Ferraz", cpf: "90277900867", cns: "700500000000003", nascimento: "1991-12-20", telefone: "(67) 99630-5512" },
];

export async function popularBanco(db: PrismaClient) {
  const senhaHash = await bcrypt.hash(SENHA_EXEMPLO, 10);

  await db.agendamento.deleteMany({});
  await db.bloqueio.deleteMany({});
  await db.disponibilidade.deleteMany({});
  await db.unidade.deleteMany({});
  await db.usuario.deleteMany({});

  await db.usuario.create({
    data: {
      nome: "Secretaria Municipal de Saúde",
      cpf: CPF_SECRETARIA,
      nascimento: "1990-01-01",
      telefone: "(67) 3242-1000",
      senhaHash,
      role: "SECRETARIA",
    },
  });

  const cidadaos = [];
  for (const c of CIDADAOS_EXEMPLO) {
    cidadaos.push(
      await db.usuario.create({
        data: { ...c, senhaHash, role: "CIDADAO" },
      })
    );
  }

  const unidades = [];
  for (const u of UNIDADES_EXEMPLO) {
    const unidade = await db.unidade.create({
      data: {
        nome: u.nome,
        slug: u.slug,
        tipo: u.tipo,
        endereco: u.endereco,
        bairro: u.bairro,
        cidade: CIDADE,
        uf: UF,
        telefone: u.telefone,
        funcionamento: u.funcionamento,
        observacao: u.observacao,
        ativa: true,
      },
    });
    unidades.push(unidade);

    for (const [especialidade, dias, turnos, vagas] of u.oferta) {
      for (const diaSemana of dias) {
        for (const turno of turnos) {
          await db.disponibilidade.create({
            data: { unidadeId: unidade.id, especialidade, diaSemana, turno, vagas, ativa: true },
          });
        }
      }
    }
  }

  // Um feriado de exemplo, para a secretaria ver como o bloqueio aparece.
  const daquiDuasSemanas = proximosDias(1, 14)[0];
  await db.bloqueio.create({
    data: {
      unidadeId: unidades[0].id,
      data: daquiDuasSemanas,
      motivo: "Dedetização da unidade",
    },
  });

  // Alguns agendamentos já marcados, para o painel não abrir vazio.
  const dias = proximosDias(6, 1);
  const marcados: { unidade: number; esp: string; turno: string; dia: number; cidadao: number }[] = [
    { unidade: 0, esp: "Clínico Geral", turno: "MANHA", dia: 0, cidadao: 0 },
    { unidade: 0, esp: "Clínico Geral", turno: "MANHA", dia: 0, cidadao: 1 },
    { unidade: 0, esp: "Odontologia", turno: "TARDE", dia: 1, cidadao: 2 },
    { unidade: 1, esp: "Enfermagem", turno: "MANHA", dia: 1, cidadao: 0 },
    { unidade: 2, esp: "Coleta de exames", turno: "MANHA", dia: 2, cidadao: 1 },
  ];

  let criados = 0;
  for (const m of marcados) {
    const data = dias[m.dia];
    const diaSemana = diaDaSemana(data);
    const existe = await db.disponibilidade.findFirst({
      where: {
        unidadeId: unidades[m.unidade].id,
        especialidade: m.esp,
        diaSemana,
        turno: m.turno,
        ativa: true,
      },
    });
    if (!existe) continue; // a data caiu num dia em que a unidade não abre essa especialidade
    await db.agendamento.create({
      data: {
        protocolo: gerarProtocolo(),
        unidadeId: unidades[m.unidade].id,
        cidadaoId: cidadaos[m.cidadao].id,
        especialidade: m.esp,
        data,
        turno: m.turno,
        status: "CONFIRMADO",
      },
    });
    criados++;
  }

  return { unidades: unidades.length, agendamentos: criados, cidadaos: cidadaos.length };
}

export function dataDeHoje() {
  return iso(new Date());
}
