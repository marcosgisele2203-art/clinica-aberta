import Link from "next/link";
import { TURNOS, iniciais, turnoRotulo } from "@/lib/domain";

export function Avatar({ nome, grande = false }: { nome: string; grande?: boolean }) {
  return <div className={grande ? "avatar lg" : "avatar"}>{iniciais(nome)}</div>;
}

export function Stat({ numero, rotulo }: { numero: string | number; rotulo: string }) {
  return (
    <div className="stat">
      <span className="n">{numero}</span>
      <span className="l">{rotulo}</span>
    </div>
  );
}

export function SeloTurno({ turno }: { turno: string }) {
  const faixa = TURNOS.find((t) => t.valor === turno)?.faixa;
  return (
    <span className="pill neutral">
      {turnoRotulo(turno)}
      {faixa ? ` · ${faixa}` : ""}
    </span>
  );
}

export function SeloStatus({ status }: { status: string }) {
  const mapa: Record<string, { classe: string; texto: string }> = {
    CONFIRMADO: { classe: "ok", texto: "Confirmado" },
    COMPARECEU: { classe: "ok", texto: "Compareceu" },
    CANCELADO: { classe: "neutral", texto: "Cancelado" },
    FALTOU: { classe: "crit", texto: "Faltou" },
  };
  const s = mapa[status] ?? { classe: "neutral", texto: status };
  return (
    <span className={`pill ${s.classe}`}>
      <span className="dot" />
      {s.texto}
    </span>
  );
}

type CardUnidade = {
  slug: string;
  nome: string;
  tipo: string;
  bairro: string;
  endereco: string;
  cidade: string;
  uf: string;
  funcionamento: string;
  especialidades: string[];
};

export function CartaoUnidade({ unidade }: { unidade: CardUnidade }) {
  return (
    <Link href={`/unidade/${unidade.slug}`} className="card doc-card">
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <h3>{unidade.nome}</h3>
          <p className="small" style={{ color: "var(--brand)", fontWeight: 600 }}>
            {unidade.tipo} · {unidade.bairro}
          </p>
        </div>
      </div>
      <hr className="sep" style={{ margin: "13px 0" }} />
      <p className="small">{unidade.endereco}</p>
      <p className="small muted">
        {unidade.cidade}/{unidade.uf} · {unidade.funcionamento}
      </p>
      {unidade.especialidades.length > 0 && (
        <div className="chips" style={{ marginTop: 12 }}>
          {unidade.especialidades.slice(0, 4).map((e) => (
            <span className="chip" key={e}>
              {e}
            </span>
          ))}
          {unidade.especialidades.length > 4 && (
            <span className="chip muted">+{unidade.especialidades.length - 4}</span>
          )}
        </div>
      )}
    </Link>
  );
}
