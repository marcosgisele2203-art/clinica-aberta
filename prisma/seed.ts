import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const SENHA = "senha123";

type Semente = {
  nome: string;
  email: string;
  telefone: string;
  crm: string;
  crmUf: string;
  especialidade: string;
  clinica: string;
  slug: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  diasSemana: string;
  horaInicio: number;
  horaFim: number;
  duracaoMin: number;
  valorCentavos: number;
  convenios: string;
  plano: string;
  status: string;
  bio: string;
};

const medicos: Semente[] = [
  {
    nome: "Dra. Helena Fontes", email: "helena@corevida.com.br", telefone: "(11) 99712-4480",
    crm: "118423", crmUf: "SP", especialidade: "Cardiologia",
    clinica: "Cor & Vida Cardiologia", slug: "dra-helena-fontes",
    cep: "05422-001", endereco: "Rua dos Pinheiros, 1240 — sala 32", bairro: "Pinheiros", cidade: "São Paulo", uf: "SP",
    diasSemana: "1,2,3,4,5", horaInicio: 8, horaFim: 17, duracaoMin: 30, valorCentavos: 38000,
    convenios: "Particular,Unimed,SulAmérica", plano: "Profissional", status: "APROVADO",
    bio: "Cardiologista com foco em prevenção e acompanhamento de hipertensão. Atende com ecocardiograma e teste ergométrico no próprio consultório.",
  },
  {
    nome: "Dr. Rogério Vasques", email: "rogerio@pantanalortopedia.com.br", telefone: "(67) 98814-2290",
    crm: "9212", crmUf: "MS", especialidade: "Ortopedia",
    clinica: "Instituto Pantanal de Ortopedia", slug: "dr-rogerio-vasques",
    cep: "79002-072", endereco: "Av. Afonso Pena, 3570 — 4º andar", bairro: "Centro", cidade: "Campo Grande", uf: "MS",
    diasSemana: "1,3,5", horaInicio: 9, horaFim: 16, duracaoMin: 40, valorCentavos: 29000,
    convenios: "Particular,Unimed,Amil", plano: "Essencial", status: "APROVADO",
    bio: "Ortopedista de joelho e quadril. Atende lesões esportivas e faz infiltração guiada por ultrassom.",
  },
  {
    nome: "Dra. Marina Okada", email: "marina@peleclara.com.br", telefone: "(41) 99630-1177",
    crm: "42880", crmUf: "PR", especialidade: "Dermatologia",
    clinica: "Pele Clara Dermatologia", slug: "dra-marina-okada",
    cep: "80420-000", endereco: "Rua Comendador Araújo, 410 — conj. 7", bairro: "Batel", cidade: "Curitiba", uf: "PR",
    diasSemana: "2,3,4,5,6", horaInicio: 10, horaFim: 19, duracaoMin: 30, valorCentavos: 42000,
    convenios: "Particular,Bradesco Saúde", plano: "Clínica", status: "APROVADO",
    bio: "Dermatologia clínica e cirúrgica. Mapeamento de pintas por dermatoscopia digital e tratamento de acne.",
  },
  {
    nome: "Dr. Caio Brandão", email: "caio@consultoriocaio.com.br", telefone: "(71) 99145-7731",
    crm: "27105", crmUf: "BA", especialidade: "Pediatria",
    clinica: "Consultório Pediátrico Caio Brandão", slug: "dr-caio-brandao",
    cep: "41940-360", endereco: "Rua da Paciência, 215 — sala 2", bairro: "Rio Vermelho", cidade: "Salvador", uf: "BA",
    diasSemana: "1,2,4,5", horaInicio: 8, horaFim: 15, duracaoMin: 30, valorCentavos: 26000,
    convenios: "Particular,Unimed,NotreDame Intermédica", plano: "Essencial", status: "APROVADO",
    bio: "Puericultura do recém-nascido ao adolescente, com consulta de acolhimento para mães de primeira viagem.",
  },
  {
    nome: "Dra. Yara Nogueira", email: "yara@espacoyara.com.br", telefone: "(67) 99902-3344",
    crm: "11407", crmUf: "MS", especialidade: "Ginecologia",
    clinica: "Espaço Yara Saúde da Mulher", slug: "dra-yara-nogueira",
    cep: "79380-000", endereco: "Rua Barão do Rio Branco, 88", bairro: "Centro", cidade: "Miranda", uf: "MS",
    diasSemana: "1,2,3,4", horaInicio: 13, horaFim: 19, duracaoMin: 40, valorCentavos: 30000,
    convenios: "Particular,Unimed", plano: "Profissional", status: "PENDENTE",
    bio: "Ginecologia e obstetrícia, pré-natal de baixo risco e planejamento familiar.",
  },
  {
    nome: "Dr. Elias Monteiro", email: "elias@nucleomonteiro.com.br", telefone: "(21) 98477-0912",
    crm: "88740", crmUf: "RJ", especialidade: "Psiquiatria",
    clinica: "Núcleo Monteiro", slug: "dr-elias-monteiro",
    cep: "24220-000", endereco: "Rua Gavião Peixoto, 90 — sala 1105", bairro: "Icaraí", cidade: "Niterói", uf: "RJ",
    diasSemana: "1,2,3,4,5", horaInicio: 14, horaFim: 20, duracaoMin: 50, valorCentavos: 45000,
    convenios: "Particular", plano: "Profissional", status: "PENDENTE",
    bio: "Psiquiatria adulta, transtornos de ansiedade e humor. Primeira consulta de 50 minutos.",
  },
];

function iso(d: Date) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

async function main() {
  const senhaHash = await bcrypt.hash(SENHA, 10);

  await db.consulta.deleteMany();
  await db.medico.deleteMany();
  await db.user.deleteMany();

  await db.user.create({
    data: { nome: "Equipe Clínica Aberta", email: "admin@clinicaaberta.com.br", senhaHash, role: "ADMIN" },
  });

  const paciente = await db.user.create({
    data: {
      nome: "Ana Lúcia Prado", email: "ana@exemplo.com.br", senhaHash,
      telefone: "(11) 98822-1109", role: "PACIENTE",
    },
  });

  for (const m of medicos) {
    const user = await db.user.create({
      data: { nome: m.nome, email: m.email, senhaHash, telefone: m.telefone, role: "MEDICO" },
    });
    await db.medico.create({
      data: {
        userId: user.id,
        crm: m.crm, crmUf: m.crmUf, especialidade: m.especialidade, bio: m.bio,
        clinica: m.clinica, slug: m.slug, cep: m.cep, endereco: m.endereco,
        bairro: m.bairro, cidade: m.cidade, uf: m.uf,
        diasSemana: m.diasSemana, horaInicio: m.horaInicio, horaFim: m.horaFim,
        duracaoMin: m.duracaoMin, valorCentavos: m.valorCentavos, convenios: m.convenios,
        plano: m.plano, status: m.status,
        publicadoEm: m.status === "APROVADO" ? new Date() : null,
      },
    });
  }

  // Algumas consultas na agenda da Dra. Helena, para o painel do médico abrir com conteúdo.
  const helena = await db.medico.findUnique({ where: { slug: "dra-helena-fontes" } });
  if (helena) {
    const hoje = new Date();
    const amanha = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
    const agenda = [
      { data: iso(hoje), hora: "09:00", nome: "Ana Lúcia Prado", telefone: "(11) 98822-1109", convenio: "Unimed", pacienteId: paciente.id },
      { data: iso(hoje), hora: "10:30", nome: "Sebastião Reis", telefone: "(11) 99100-4412", convenio: "Particular", pacienteId: null },
      { data: iso(hoje), hora: "14:00", nome: "Marcos Vinícius Lima", telefone: "(11) 99654-2231", convenio: "SulAmérica", pacienteId: null },
      { data: iso(amanha), hora: "08:30", nome: "Dulce Ferraz", telefone: "(11) 98123-7760", convenio: "Unimed", pacienteId: null },
    ];
    for (const c of agenda) {
      await db.consulta.create({
        data: { medicoId: helena.id, ...c, motivo: "", status: "CONFIRMADA" },
      });
    }
  }

  console.log("Banco populado.");
  console.log(`  admin@clinicaaberta.com.br  /  ${SENHA}   (admin)`);
  console.log(`  helena@corevida.com.br      /  ${SENHA}   (médica com agenda cheia)`);
  console.log(`  ana@exemplo.com.br          /  ${SENHA}   (paciente)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
