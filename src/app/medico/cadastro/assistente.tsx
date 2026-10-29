"use client";

import { useActionState, useState } from "react";
import { cadastrarClinica, type EstadoCadastro } from "../actions";
import {
  CONVENIOS,
  DIAS_CURTOS,
  ESPECIALIDADES,
  PLANOS,
  UFS,
  brl,
  horariosDoDia,
} from "@/lib/domain";

const PASSOS = ["Médico", "Clínica", "Atendimento", "Plano"];

type Campos = {
  crm: string;
  crmUf: string;
  especialidade: string;
  bio: string;
  clinica: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  horaInicio: number;
  horaFim: number;
  duracaoMin: number;
  valor: number;
};

export default function Assistente({ nome, planoInicial }: { nome: string; planoInicial: string }) {
  const [passo, setPasso] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [dias, setDias] = useState<number[]>([1, 2, 3, 4, 5]);
  const [convenios, setConvenios] = useState<string[]>(["Particular"]);
  const [plano, setPlano] = useState(
    PLANOS.some((p) => p.nome === planoInicial) ? planoInicial : "Profissional"
  );
  const [campos, setCampos] = useState<Campos>({
    crm: "",
    crmUf: "MS",
    especialidade: ESPECIALIDADES[0],
    bio: "",
    clinica: "",
    cep: "",
    endereco: "",
    bairro: "",
    cidade: "",
    uf: "MS",
    horaInicio: 8,
    horaFim: 18,
    duracaoMin: 30,
    valor: 300,
  });
  const [estado, enviar, enviando] = useActionState<EstadoCadastro, FormData>(cadastrarClinica, {});

  function set<K extends keyof Campos>(campo: K, valor: Campos[K]) {
    setCampos((c) => ({ ...c, [campo]: valor }));
  }

  function alternar<T>(lista: T[], valor: T, aplicar: (l: T[]) => void) {
    aplicar(lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);
  }

  function avancar() {
    setAviso(null);
    if (passo === 0) {
      if (campos.crm.replace(/\D/g, "").length < 3) return setAviso("Informe o número do CRM.");
    }
    if (passo === 1) {
      if (campos.clinica.trim().length < 3) return setAviso("Informe o nome da clínica.");
      if (!campos.endereco.trim()) return setAviso("Informe o endereço com número.");
      if (!campos.cidade.trim()) return setAviso("Informe a cidade.");
    }
    if (passo === 2) {
      if (!dias.length) return setAviso("Escolha pelo menos um dia de atendimento.");
      if (campos.horaFim <= campos.horaInicio)
        return setAviso("O horário final precisa ser depois do inicial.");
      if (!convenios.length) return setAviso("Marque ao menos um convênio ou Particular.");
    }
    setPasso((p) => Math.min(3, p + 1));
  }

  const porDia = horariosDoDia(campos.horaInicio, campos.horaFim, campos.duracaoMin).length;

  return (
    <>
      <section className="steps">
        {PASSOS.map((p, i) => (
          <div key={p} className={`step${i === passo ? " on" : i < passo ? " done" : ""}`}>
            {i + 1}. {p}
          </div>
        ))}
      </section>

      <form action={enviar} className="card grid" style={{ gap: 16 }}>
        {dias.map((d) => (
          <input key={d} type="hidden" name="diasSemana" value={d} />
        ))}
        {convenios.map((c) => (
          <input key={c} type="hidden" name="convenios" value={c} />
        ))}
        <input type="hidden" name="plano" value={plano} />

        <fieldset hidden={passo !== 0} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 16 }}>
          <div className="grid cols-2">
            <label className="f">
              Número do CRM
              <input name="crm" value={campos.crm} onChange={(e) => set("crm", e.target.value)} placeholder="Somente números" />
            </label>
            <label className="f">
              UF do CRM
              <select name="crmUf" value={campos.crmUf} onChange={(e) => set("crmUf", e.target.value)}>
                {UFS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
            <label className="f">
              Especialidade principal
              <select
                name="especialidade"
                value={campos.especialidade}
                onChange={(e) => set("especialidade", e.target.value)}
              >
                {ESPECIALIDADES.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="small muted">
            Cadastrando como <strong>{nome}</strong>. O CRM é conferido na consulta pública do
            Conselho Federal de Medicina antes da clínica ir ao ar.
          </p>
        </fieldset>

        <fieldset hidden={passo !== 1} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 16 }}>
          <div className="grid cols-2">
            <label className="f">
              Nome da clínica ou consultório
              <input name="clinica" value={campos.clinica} onChange={(e) => set("clinica", e.target.value)} />
            </label>
            <label className="f">
              CEP
              <input name="cep" value={campos.cep} onChange={(e) => set("cep", e.target.value)} placeholder="00000-000" />
            </label>
            <label className="f">
              Endereço e número
              <input name="endereco" value={campos.endereco} onChange={(e) => set("endereco", e.target.value)} placeholder="Rua, número, sala" />
            </label>
            <label className="f">
              Bairro
              <input name="bairro" value={campos.bairro} onChange={(e) => set("bairro", e.target.value)} />
            </label>
            <label className="f">
              Cidade
              <input name="cidade" value={campos.cidade} onChange={(e) => set("cidade", e.target.value)} />
            </label>
            <label className="f">
              UF da clínica
              <select name="uf" value={campos.uf} onChange={(e) => set("uf", e.target.value)}>
                {UFS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="f">
            Sobre o atendimento
            <textarea
              name="bio"
              value={campos.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="O que você atende, exames feitos no consultório, como é a primeira consulta."
            />
          </label>
        </fieldset>

        <fieldset hidden={passo !== 2} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 16 }}>
          <div>
            <p className="eyebrow">Dias de atendimento</p>
            <div className="chips" style={{ marginTop: 8 }}>
              {DIAS_CURTOS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  className="chip"
                  aria-pressed={dias.includes(i)}
                  onClick={() => alternar(dias, i, setDias)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="grid cols-3">
            <label className="f">
              Começa às
              <select name="horaInicio" value={campos.horaInicio} onChange={(e) => set("horaInicio", Number(e.target.value))}>
                {[6, 7, 8, 9, 10, 11, 12, 13, 14].map((h) => (
                  <option key={h} value={h}>
                    {h}:00
                  </option>
                ))}
              </select>
            </label>
            <label className="f">
              Termina às
              <select name="horaFim" value={campos.horaFim} onChange={(e) => set("horaFim", Number(e.target.value))}>
                {[12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((h) => (
                  <option key={h} value={h}>
                    {h}:00
                  </option>
                ))}
              </select>
            </label>
            <label className="f">
              Duração da consulta
              <select name="duracaoMin" value={campos.duracaoMin} onChange={(e) => set("duracaoMin", Number(e.target.value))}>
                {[20, 30, 40, 50, 60].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </label>
            <label className="f">
              Valor da consulta particular (R$)
              <input
                name="valor"
                type="number"
                min={0}
                step={10}
                value={campos.valor}
                onChange={(e) => set("valor", Number(e.target.value))}
              />
            </label>
          </div>
          <div>
            <p className="eyebrow">Convênios atendidos</p>
            <div className="chips" style={{ marginTop: 8 }}>
              {CONVENIOS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="chip"
                  aria-pressed={convenios.includes(c)}
                  onClick={() => alternar(convenios, c, setConvenios)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <p className="small muted">
            Com esses horários a agenda abre <strong className="mono">{porDia}</strong> consultas por
            dia de atendimento.
          </p>
        </fieldset>

        <fieldset hidden={passo !== 3} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 16 }}>
          <div>
            <p className="eyebrow">Plano</p>
            <div className="grid cols-3" style={{ marginTop: 10 }}>
              {PLANOS.map((p) => (
                <button
                  key={p.nome}
                  type="button"
                  className={plano === p.nome ? "plan featured" : "plan"}
                  onClick={() => setPlano(p.nome)}
                  style={{ cursor: "pointer" }}
                >
                  <h3>{p.nome}</h3>
                  <p className="p">
                    {brl(p.centavos)} <span className="muted" style={{ fontSize: 13 }}>/mês</span>
                  </p>
                  <p className="small muted">{p.resumo}</p>
                  {plano === p.nome && <span className="pill ok">Selecionado</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="aviso">
            <p className="eyebrow">Confira antes de enviar</p>
            <p className="small" style={{ marginTop: 8 }}>
              <strong>{nome}</strong> · {campos.especialidade} · CRM/{campos.crmUf}{" "}
              {campos.crm || "—"}
            </p>
            <p className="small">
              {campos.clinica || "—"} — {campos.endereco || "—"}, {campos.bairro || "—"},{" "}
              {campos.cidade || "—"}/{campos.uf}
            </p>
            <p className="small">
              {dias.map((d) => DIAS_CURTOS[d]).join(", ")} · {campos.horaInicio}h às {campos.horaFim}
              h · {campos.duracaoMin} min · {brl(campos.valor * 100)}
            </p>
            <p className="small">Convênios: {convenios.join(", ") || "—"}</p>
          </div>
          <p className="small muted">
            O primeiro mês só é cobrado depois da aprovação. Enquanto isso o cadastro fica em
            análise.
          </p>
        </fieldset>

        {(aviso || estado.erro) && <p className="erro">{aviso ?? estado.erro}</p>}

        <div className="row between" style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
          {passo > 0 ? (
            <button className="btn ghost" type="button" onClick={() => setPasso((p) => p - 1)}>
              Voltar
            </button>
          ) : (
            <span />
          )}
          {passo < 3 ? (
            <button className="btn" type="button" onClick={avancar}>
              Continuar
            </button>
          ) : (
            <button className="btn" type="submit" disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar para análise"}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
