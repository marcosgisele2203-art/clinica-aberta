"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { agendar, type EstadoAgendamento } from "./actions";
import { DIAS_CURTOS, dataBR } from "@/lib/domain";

type Horario = { hora: string; livre: boolean };

export default function AgendarForm({
  slug,
  medicoNome,
  datas,
  dataSelecionada,
  horarios,
  convenios,
}: {
  slug: string;
  medicoNome: string;
  datas: string[];
  dataSelecionada: string | null;
  horarios: Horario[];
  convenios: string[];
}) {
  const router = useRouter();
  const [hora, setHora] = useState<string | null>(null);
  const [estado, enviar, enviando] = useActionState<EstadoAgendamento, FormData>(agendar, {});

  function trocarDia(data: string) {
    setHora(null);
    router.push(`/clinica/${slug}?dia=${data}`, { scroll: false });
  }

  if (estado.ok) {
    return (
      <div style={{ display: "grid", gap: 10, justifyItems: "start" }}>
        <span className="pill ok">
          <span className="dot" />
          Consulta confirmada
        </span>
        <p>
          <strong>{medicoNome}</strong> espera você em{" "}
          <strong className="mono">
            {dataBR(estado.ok.data)} às {estado.ok.hora}
          </strong>
          .
        </p>
        <p className="small muted">
          O consultório confirma por WhatsApp no telefone informado. Leve um documento com foto e a
          carteirinha do convênio.
        </p>
        <button className="btn ghost sm" onClick={() => router.refresh()}>
          Marcar outra consulta
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="days">
        {datas.map((d) => {
          const dia = new Date(`${d}T12:00:00`);
          return (
            <button
              key={d}
              type="button"
              className={`day${d === dataSelecionada ? " on" : ""}`}
              onClick={() => trocarDia(d)}
            >
              <span className="dw">{DIAS_CURTOS[dia.getDay()]}</span>
              <br />
              <span className="dn">{String(dia.getDate()).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>

      {horarios.length ? (
        <div className="slots" style={{ marginTop: 14 }}>
          {horarios.map((h) => (
            <button
              key={h.hora}
              type="button"
              className={`slot${hora === h.hora ? " on" : ""}`}
              disabled={!h.livre}
              onClick={() => setHora(hora === h.hora ? null : h.hora)}
            >
              {h.hora}
            </button>
          ))}
        </div>
      ) : (
        <p className="muted small" style={{ marginTop: 14 }}>
          Sem atendimento neste dia.
        </p>
      )}

      {hora && dataSelecionada && (
        <form
          action={enviar}
          className="grid"
          style={{ marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 16 }}
        >
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="data" value={dataSelecionada} />
          <input type="hidden" name="hora" value={hora} />
          <p className="small">
            Consulta com <strong>{medicoNome}</strong> em{" "}
            <strong className="mono">
              {dataBR(dataSelecionada)} às {hora}
            </strong>
          </p>
          <div className="grid cols-2">
            <label className="f">
              Nome do paciente
              <input name="nome" required placeholder="Nome completo" />
            </label>
            <label className="f">
              Telefone / WhatsApp
              <input name="telefone" required placeholder="(00) 00000-0000" />
            </label>
            <label className="f">
              Convênio
              <select name="convenio">
                {convenios.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="f">
              Motivo da consulta
              <input name="motivo" placeholder="Opcional" />
            </label>
          </div>
          {estado.erro && <p className="erro">{estado.erro}</p>}
          <div className="row">
            <button className="btn" type="submit" disabled={enviando}>
              {enviando ? "Confirmando…" : "Confirmar agendamento"}
            </button>
            <button className="btn ghost" type="button" onClick={() => setHora(null)}>
              Escolher outro horário
            </button>
          </div>
        </form>
      )}
    </>
  );
}
