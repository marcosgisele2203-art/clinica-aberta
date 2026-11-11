// Disputa pela vaga contra um Postgres DESCARTÁVEL:
//   DATABASE_URL=postgresql://.../banco_de_teste npx prisma db push && npm test
// Sem DATABASE_URL o teste é pulado. Nunca aponte para o banco de produção.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { reservarVaga } from "../src/lib/agendamento";
import { diaDaSemana, hoje, somarDias } from "../src/lib/domain";

const semBanco = !process.env.DATABASE_URL && "Defina DATABASE_URL de um banco de teste para rodar.";
const db = semBanco ? null : new PrismaClient();
after(async () => db?.$disconnect());

const unico = () => Math.random().toString(36).slice(2, 10);
let cpfSeq = Date.now() % 1e9;

async function cenario(vagas: number) {
  const unidade = await db!.unidade.create({
    data: { nome: "UBS Teste", slug: "teste-" + unico(), endereco: "Rua A", bairro: "Centro", cidade: "Miranda", uf: "MS" },
  });
  const data = somarDias(hoje(), 7);
  await db!.disponibilidade.create({
    data: { unidadeId: unidade.id, especialidade: "Clínico Geral", diaSemana: diaDaSemana(data), turno: "MANHA", vagas },
  });
  const pessoa = () =>
    db!.usuario.create({
      data: { nome: "Morador", cpf: String(cpfSeq++).padStart(11, "9"), nascimento: "1990-01-01", senhaHash: "x" },
    });
  const pedido = (cidadaoId: string) => ({
    unidadeId: unidade.id, cidadaoId, especialidade: "Clínico Geral", data, turno: "MANHA", observacao: "",
  });
  return { unidade, data, pessoa, pedido };
}

test("última vaga disputada ao mesmo tempo: só uma pessoa confirma", { skip: semBanco }, async () => {
  const { unidade, pessoa, pedido } = await cenario(1);
  const pessoas = await Promise.all(Array.from({ length: 6 }, pessoa));
  const resultados = await Promise.allSettled(pessoas.map((p) => reservarVaga(db!, pedido(p.id))));
  const confirmados = resultados.filter((r) => r.status === "fulfilled");
  assert.equal(confirmados.length, 1, "exatamente uma confirmação");
  const gravados = await db!.agendamento.count({ where: { unidadeId: unidade.id } });
  assert.equal(gravados, 1, "nada além da vaga existente foi gravado");
});

test("com as vagas cheias, o próximo recebe SEM_VAGA", { skip: semBanco }, async () => {
  const { pessoa, pedido } = await cenario(2);
  for (let i = 0; i < 2; i++) await reservarVaga(db!, pedido((await pessoa()).id));
  await assert.rejects(reservarVaga(db!, pedido((await pessoa()).id)), /SEM_VAGA/);
});

test("cancelado devolve a vaga", { skip: semBanco }, async () => {
  const { pessoa, pedido } = await cenario(1);
  const a = await pessoa();
  const protocolo = await reservarVaga(db!, pedido(a.id));
  await db!.agendamento.update({ where: { protocolo }, data: { status: "CANCELADO" } });
  await reservarVaga(db!, pedido((await pessoa()).id));
});

test("morador não acumula dois agendamentos futuros da mesma especialidade", { skip: semBanco }, async () => {
  const { pessoa, pedido } = await cenario(5);
  const a = await pessoa();
  await reservarVaga(db!, pedido(a.id));
  await assert.rejects(reservarVaga(db!, pedido(a.id)), /JA_MARCOU/);
});

test("dia bloqueado e dia sem atendimento são recusados", { skip: semBanco }, async () => {
  const { unidade, data, pessoa, pedido } = await cenario(5);
  const a = await pessoa();
  await assert.rejects(reservarVaga(db!, { ...pedido(a.id), data: somarDias(data, 1) }), /SEM_ATENDIMENTO/);
  await db!.bloqueio.create({ data: { unidadeId: unidade.id, data, motivo: "Dedetização" } });
  await assert.rejects(reservarVaga(db!, pedido(a.id)), /BLOQUEADO/);
});
