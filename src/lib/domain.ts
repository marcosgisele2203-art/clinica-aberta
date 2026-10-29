export const ESPECIALIDADES = [
  "Clínico Geral",
  "Pediatria",
  "Ginecologia e Pré-natal",
  "Odontologia",
  "Enfermagem",
  "Vacinação",
  "Coleta de exames",
  "Psicologia",
  "Nutrição",
  "Fisioterapia",
];

export const TIPOS_UNIDADE = [
  "UBS",
  "ESF",
  "Unidade Mista",
  "Centro de Especialidades",
  "CAPS",
  "Policlínica",
];

export const TURNOS = [
  { valor: "MANHA", rotulo: "Manhã", faixa: "7h às 11h" },
  { valor: "TARDE", rotulo: "Tarde", faixa: "13h às 17h" },
];

export const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export const DIAS_LONGOS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

export const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

export function turnoRotulo(turno: string) {
  return TURNOS.find((t) => t.valor === turno)?.rotulo ?? turno;
}

export function turnoFaixa(turno: string) {
  return TURNOS.find((t) => t.valor === turno)?.faixa ?? "";
}

/* ───── Datas ─────
 * O servidor costuma rodar em UTC. Se usássemos a data da máquina, depois das 21h
 * no Brasil o sistema já estaria no dia seguinte — a agenda do dia sairia errada.
 * Por isso toda data nasce no fuso do município e as contas são feitas em UTC ao
 * meio-dia, que nunca muda de dia por causa de horário de verão.
 */

export const FUSO = process.env.NEXT_PUBLIC_FUSO || "America/Campo_Grande";

const formatador = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Data de um instante, no fuso do município, como AAAA-MM-DD. */
export function iso(d: Date = new Date()) {
  return formatador.format(d);
}

export function hoje() {
  return iso(new Date());
}

/** Soma dias a uma data AAAA-MM-DD sem envolver fuso nenhum. */
export function somarDias(isoStr: string, dias: number) {
  const d = new Date(`${isoStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function dataBR(isoStr: string) {
  const [a, m, d] = isoStr.split("-");
  return `${d}/${m}/${a}`;
}

export function dataCurta(isoStr: string) {
  const [, m, d] = isoStr.split("-");
  return `${d}/${m}`;
}

export function diaDaSemana(isoStr: string) {
  return new Date(`${isoStr}T12:00:00Z`).getUTCDay();
}

export function diaPorExtenso(isoStr: string) {
  return DIAS_LONGOS[diaDaSemana(isoStr)];
}

/** Datas dos próximos dias, a partir de amanhã (o posto não agenda para o mesmo dia). */
export function proximosDias(quantidade = 21, comecarEm = 1) {
  const base = hoje();
  const out: string[] = [];
  for (let i = comecarEm; i < comecarEm + quantidade; i++) out.push(somarDias(base, i));
  return out;
}

export function idade(nascimento: string) {
  const [a, m, d] = nascimento.split("-").map(Number);
  const [ah, mh, dh] = hoje().split("-").map(Number);
  let anos = ah - a;
  if (mh < m || (mh === m && dh < d)) anos--;
  return anos;
}

/* ───── Documentos ───── */

export function apenasNumeros(s: string) {
  return (s || "").replace(/\D/g, "");
}

/** Valida CPF pelos dígitos verificadores. */
export function cpfValido(entrada: string) {
  const cpf = apenasNumeros(entrada);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digito = (ate: number) => {
    let soma = 0;
    let peso = ate + 1;
    for (let i = 0; i < ate; i++) soma += Number(cpf[i]) * peso--;
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10]);
}

export function formatarCpf(entrada: string) {
  const c = apenasNumeros(entrada).padStart(11, "0");
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
}

/** Esconde o miolo do CPF nas telas da secretaria: 123.***.**9-00 não serve para nada além de conferir. */
export function cpfMascarado(entrada: string) {
  const c = apenasNumeros(entrada).padStart(11, "0");
  return `${c.slice(0, 3)}.***.***-${c.slice(9)}`;
}

/** O cartão SUS tem 15 dígitos. Não validamos o dígito verificador para não barrar número legítimo. */
export function cnsAceitavel(entrada: string) {
  const c = apenasNumeros(entrada);
  return c.length === 0 || c.length === 15;
}

export function formatarCns(entrada: string) {
  const c = apenasNumeros(entrada);
  if (c.length !== 15) return entrada;
  return `${c.slice(0, 3)} ${c.slice(3, 7)} ${c.slice(7, 11)} ${c.slice(11)}`;
}

export function formatarTelefone(entrada: string) {
  const t = apenasNumeros(entrada);
  if (t.length === 11) return `(${t.slice(0, 2)}) ${t.slice(2, 7)}-${t.slice(7)}`;
  if (t.length === 10) return `(${t.slice(0, 2)}) ${t.slice(2, 6)}-${t.slice(6)}`;
  return entrada;
}

/* ───── Texto ───── */

export function gerarSlug(texto: string) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function iniciais(nome: string) {
  const partes = (nome || "").trim().split(/\s+/);
  const a = partes[0]?.[0] ?? "";
  const b = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (a + b).toUpperCase();
}

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem I, O, 0 e 1: confunde na hora de ditar

/** Protocolo curto, do tipo AGD-7F3K2, para o cidadão apresentar na recepção. */
export function gerarProtocolo() {
  let s = "";
  for (let i = 0; i < 5; i++) s += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  return `AGD-${s}`;
}

export function primeiroNome(nome: string) {
  return (nome || "").trim().split(/\s+/)[0] ?? "";
}
