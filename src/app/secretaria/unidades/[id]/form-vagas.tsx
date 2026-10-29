"use client";

import { useState } from "react";
import { salvarDisponibilidade } from "../../actions";
import { DIAS_CURTOS, ESPECIALIDADES, TURNOS } from "@/lib/domain";

export default function FormularioVagas({ unidadeId }: { unidadeId: string }) {
  const [dias, setDias] = useState<number[]>([1, 2, 3, 4, 5]);

  function alternar(dia: number) {
    setDias((atual) => (atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia].sort()));
  }

  return (
    <form action={salvarDisponibilidade} className="card grid" style={{ gap: 16, marginTop: 10 }}>
      <input type="hidden" name="unidadeId" value={unidadeId} />
      {dias.map((d) => (
        <input key={d} type="hidden" name="dias" value={d} />
      ))}

      <div className="grid cols-3">
        <label className="f">
          Especialidade
          <select name="especialidade" defaultValue={ESPECIALIDADES[0]}>
            {ESPECIALIDADES.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </label>
        <label className="f">
          Turno
          <select name="turno" defaultValue="MANHA">
            {TURNOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.rotulo} ({t.faixa})
              </option>
            ))}
          </select>
        </label>
        <label className="f">
          Vagas por dia
          <input name="vagas" type="number" min={0} max={500} defaultValue={15} />
        </label>
      </div>

      <div>
        <p className="eyebrow">Dias da semana</p>
        <div className="chips" style={{ marginTop: 8 }}>
          {DIAS_CURTOS.map((d, i) => (
            <button
              key={d}
              type="button"
              className="chip"
              aria-pressed={dias.includes(i)}
              onClick={() => alternar(i)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <p className="small muted">
        Salvar com zero vagas desliga aquele dia sem apagar a configuração. Quem já tinha
        agendamento confirmado continua na lista.
      </p>

      <button className="btn" type="submit" style={{ justifySelf: "start" }}>
        Salvar vagas
      </button>
    </form>
  );
}
