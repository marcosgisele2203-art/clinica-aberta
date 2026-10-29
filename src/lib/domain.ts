export const ESPECIALIDADES = [
  "Cardiologia",
  "Clínica Geral",
  "Dermatologia",
  "Endocrinologia",
  "Ginecologia",
  "Oftalmologia",
  "Ortopedia",
  "Pediatria",
  "Psiquiatria",
];

export const CONVENIOS = [
  "Particular",
  "Unimed",
  "Bradesco Saúde",
  "SulAmérica",
  "Amil",
  "NotreDame Intermédica",
];

export const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

export const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export const PLANOS = [
  { nome: "Essencial", centavos: 4900, resumo: "Página e agenda para um profissional" },
  { nome: "Profissional", centavos: 9900, resumo: "Agendamentos ilimitados e destaque na busca" },
  { nome: "Clínica", centavos: 24900, resumo: "Até 8 profissionais e agenda por sala" },
];

export function brl(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function iso(d: Date) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export function hoje() {
  return iso(new Date());
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
  return new Date(`${isoStr}T12:00:00`).getDay();
}

/** Horários possíveis de um dia de atendimento, no formato HH:MM. */
export function horariosDoDia(horaInicio: number, horaFim: number, duracaoMin: number) {
  const out: string[] = [];
  let m = horaInicio * 60;
  while (m + duracaoMin <= horaFim * 60) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
    m += duracaoMin;
  }
  return out;
}

/** Próximas datas em que o médico atende, a partir de hoje. */
export function proximasDatas(diasSemana: string, quantidade = 7, janelaDias = 30) {
  const dias = listaDeDias(diasSemana);
  const base = new Date();
  const out: string[] = [];
  for (let i = 0; i < janelaDias && out.length < quantidade; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    if (dias.includes(d.getDay())) out.push(iso(d));
  }
  return out;
}

export function listaDeDias(diasSemana: string) {
  return diasSemana
    .split(",")
    .map((n) => Number(n.trim()))
    .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 6);
}

export function listaDeConvenios(convenios: string) {
  return convenios.split(",").map((c) => c.trim()).filter(Boolean);
}

export function diasPorExtenso(diasSemana: string) {
  return listaDeDias(diasSemana).map((d) => DIAS_CURTOS[d]).join(", ");
}

export function iniciais(nome: string) {
  const partes = nome.replace(/^Dra?\.?\s*/i, "").trim().split(/\s+/);
  const a = partes[0]?.[0] ?? "";
  const b = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (a + b).toUpperCase();
}

/** Converte "Dra. Helena Fontes" em "dra-helena-fontes", garantindo unicidade com um sufixo. */
export function gerarSlug(texto: string, sufixo = "") {
  const base = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return sufixo ? `${base}-${sufixo}` : base;
}

export function apenasNumeros(s: string) {
  return s.replace(/\D/g, "");
}

export function emailValido(s: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(s.trim());
}

/** Uma data/hora já passou? Usado para não oferecer horário vencido no dia corrente. */
export function jaPassou(data: string, hora: string) {
  const agora = new Date();
  return new Date(`${data}T${hora}:00`).getTime() <= agora.getTime();
}
