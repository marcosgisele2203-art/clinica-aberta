"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { agendar, type EstadoAgendamento } from "./actions";
import { DIAS_CURTOS, dataBR, diaDaSemana, diaPorExtenso, turnoFaixa, turnoRotulo } from "@/lib/domain";

export type VagaDoDia = {
  data: string;
  turno: string;
  vagas: number;
  restantes: number;
};

export default function AgendarForm({
  slug,
  unidadeNome,
  especialidade,
  vagas,
  logado,
}: {
  slug: string;
  unidadeNome: string;
  especialidade: string;
  vagas: VagaDoDia[];
  logado: boolean;
}) {
  const [escolha, setEscolha] = useState<VagaDoDia | null>(null);
  const [estado, enviar, enviando] = useActionState<EstadoAgendamento, FormData>(agendar, {});

  if (estado.ok) {
    return (
      <div className="card" style={{ display: "grid", gap: 12, justifyItems: "start" }}>
        <span className="pill ok">
          <span className="dot" />
          Agendamento confirmado
        </span>
        <p>
          <strong>{estado.ok.especialidade}</strong> em {estado.ok.unidade},{" "}
          {diaPorExtenso(estado.ok.data)}, <strong>{dataBR(estado.ok.data)}</strong>, no turno da{" "}
          <strong>{turnoRotulo(estado.ok.turno).toLowerCase()}</strong> ({turnoFaixa(estado.ok.turno)}).
        </p>
        <div className="aviso" style={{ width: "100%" }}>
          <p className="eyebrow">Protocolo</p>
          <p className="mono" style={{ fontSize: 24, fontWeight: 500, letterSpacing: "0.04em" }}>
            {estado.ok.protocolo}
          </p>
          <p className="small muted" style={{ marginTop: 6 }}>
            Leve documento com foto e o cartão SUS. Chegue no início do turno.
          </p>
        </div>
        <Link className="btn" href="/meus-agendamentos">
          Ver meus agendamentos
        </Link>
      </div>
    );
  }

  const porDia = new Map<string, VagaDoDia[]>();
  for (const v of vagas) {
    const atual = porDia.get(v.data) ?? [];
    atual.push(v);
    porDia.set(v.data, atual);
  }
  const dias = [...porDia.entries()];

  if (!dias.length) {
    return (
      <div className="aviso">
        Sem vagas abertas para {especialidade} nos próximos dias. Procure a unidade por telefone ou
        tente outra unidade.
      </div>
    );
  }

  return (
    <>
      <div className="grid" style={{ gap: 10 }}>
        {dias.map(([data, turnos]) => {

          return (
            <div className="card" key={data} style={{ padding: 14 }}>
              <div className="row between">
                <div>
                  <p style={{ fontWeight: 700 }}>
                    {DIAS_CURTOS[diaDaSemana(data)]}, {dataBR(data)}
                  </p>
                  <p className="small muted">{diaPorExtenso(data)}</p>
                </div>
                <div className="row">
                  {turnos.map((t) => {
                    const esgotado = t.restantes <= 0;
                    const escolhido =
                      escolha?.data === t.data && escolha?.turno === t.turno;
                    return (
                      <button
                        key={t.turno}
                        type="button"
                        className={`btn ${escolhido ? "" : "ghost"} sm`}
                        disabled={esgotado}
                        onClick={() => setEscolha(escolhido ? null : t)}
                        style={{ flexDirection: "column", gap: 0, minWidth: 104 }}
                      >
                        <span>{turnoRotulo(t.turno)}</span>
                        <span className="mono" style={{ fontSize: 11, opacity: 0.85 }}>
                          {esgotado ? "esgotado" : `${t.restantes} de ${t.vagas}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {escolha && (
        <form
          action={enviar}
          className="card grid"
          style={{ gap: 14, marginTop: 16, borderColor: "var(--brand)" }}
        >
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="especialidade" value={especialidade} />
          <input type="hidden" name="data" value={escolha.data} />
          <input type="hidden" name="turno" value={escolha.turno} />

          <div>
            <p className="eyebrow">Confirmar</p>
            <p style={{ marginTop: 4 }}>
              <strong>{especialidade}</strong> em {unidadeNome},{" "}
              {diaPorExtenso(escolha.data)}, {dataBR(escolha.data)}, turno da{" "}
              {turnoRotulo(escolha.turno).toLowerCase()} ({turnoFaixa(escolha.turno)}).
            </p>
          </div>

          {logado ? (
            <>
              <label className="f">
                Quer contar o motivo? (opcional)
                <input name="observacao" placeholder="Ex.: renovar receita de pressão" />
              </label>
              {estado.erro && <p className="erro">{estado.erro}</p>}
              <div className="row">
                <button className="btn" type="submit" disabled={enviando}>
                  {enviando ? "Confirmando…" : "Confirmar agendamento"}
                </button>
                <button className="btn ghost" type="button" onClick={() => setEscolha(null)}>
                  Escolher outro dia
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="aviso">
                Para confirmar, entre com seu CPF. Se ainda não tem cadastro, leva um minuto.
              </div>
              <div className="row">
                <Link className="btn" href={`/entrar?proximo=/unidade/${slug}`}>
                  Entrar com CPF
                </Link>
                <Link className="btn ghost" href={`/criar-conta?proximo=/unidade/${slug}`}>
                  Fazer cadastro
                </Link>
              </div>
            </>
          )}
        </form>
      )}
    </>
  );
}
