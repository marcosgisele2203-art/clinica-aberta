// Regras puras: datas no fuso do município e documentos. Não precisam de banco.
import { test } from "node:test";
import assert from "node:assert/strict";
import { iso, somarDias, diaDaSemana, proximosDias, hoje, cpfValido, cnsAceitavel, cpfMascarado, gerarProtocolo, gerarSlug } from "../src/lib/domain";

test("depois das 21h em Campo Grande ainda é o mesmo dia (servidor em UTC)", () => {
  // 23/03/2026 às 22h30 em Campo Grande = 24/03 às 02h30 em UTC
  assert.equal(iso(new Date("2026-03-24T02:30:00Z")), "2026-03-23");
  // meia-noite e meia em Campo Grande já é o dia seguinte
  assert.equal(iso(new Date("2026-03-24T04:30:00Z")), "2026-03-24");
});

test("somar dias atravessa mês, ano e fevereiro bissexto", () => {
  assert.equal(somarDias("2026-01-31", 1), "2026-02-01");
  assert.equal(somarDias("2026-12-31", 1), "2027-01-01");
  assert.equal(somarDias("2028-02-28", 1), "2028-02-29");
  assert.equal(somarDias("2026-03-01", -1), "2026-02-28");
});

test("dia da semana da data, sem depender do fuso", () => {
  assert.equal(diaDaSemana("2026-11-11"), 3); // quarta-feira
  assert.equal(diaDaSemana("2026-11-15"), 0); // domingo
});

test("a agenda começa amanhã e mostra 21 dias seguidos", () => {
  const dias = proximosDias();
  assert.equal(dias.length, 21);
  assert.equal(dias[0], somarDias(hoje(), 1));
  assert.ok(!dias.includes(hoje()), "não agenda para o mesmo dia");
  for (let i = 1; i < dias.length; i++) assert.equal(dias[i], somarDias(dias[i - 1], 1));
});

test("CPF: dígitos verificadores, máscara e repetidos", () => {
  assert.ok(cpfValido("111.444.777-35"));
  assert.ok(cpfValido("52998224725"));
  assert.ok(!cpfValido("111.444.777-36"));
  assert.ok(!cpfValido("111.111.111-11"), "todos iguais não vale");
  assert.ok(!cpfValido("1234"));
  assert.equal(cpfMascarado("11144477735"), "111.***.***-35");
});

test("cartão SUS: vazio ou 15 dígitos", () => {
  assert.ok(cnsAceitavel(""));
  assert.ok(cnsAceitavel("898 0010 2345 6789"));
  assert.ok(!cnsAceitavel("12345"));
});

test("protocolo e slug", () => {
  assert.match(gerarProtocolo(), /^AGD-[A-HJ-NP-Z2-9]{5}$/);
  assert.equal(gerarSlug("UBS São João — Centro"), "ubs-sao-joao-centro");
});
