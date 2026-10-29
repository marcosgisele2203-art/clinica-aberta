import Link from "next/link";
import { brl, iniciais, listaDeConvenios } from "@/lib/domain";

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

export function SeloStatus({ status }: { status: string }) {
  const mapa: Record<string, { classe: string; texto: string }> = {
    APROVADO: { classe: "ok", texto: "No ar" },
    PENDENTE: { classe: "warn", texto: "Em análise" },
    SUSPENSO: { classe: "crit", texto: "Suspensa" },
    RECUSADO: { classe: "crit", texto: "Recusada" },
  };
  const s = mapa[status] ?? { classe: "neutral", texto: status };
  return (
    <span className={`pill ${s.classe}`}>
      <span className="dot" />
      {s.texto}
    </span>
  );
}

type CardMedico = {
  slug: string;
  clinica: string;
  especialidade: string;
  crm: string;
  crmUf: string;
  bairro: string;
  cidade: string;
  uf: string;
  valorCentavos: number;
  duracaoMin: number;
  convenios: string;
  user: { nome: string };
};

export function CartaoMedico({ medico }: { medico: CardMedico }) {
  return (
    <Link href={`/clinica/${medico.slug}`} className="card doc-card">
      <div className="doc">
        <Avatar nome={medico.user.nome} />
        <div style={{ minWidth: 0 }}>
          <h3>{medico.user.nome}</h3>
          <p className="small" style={{ color: "var(--brand)", fontWeight: 600 }}>
            {medico.especialidade}
          </p>
          <p className="small muted mono">
            CRM/{medico.crmUf} {medico.crm}
          </p>
        </div>
      </div>
      <hr className="sep" style={{ margin: "13px 0" }} />
      <p className="small">{medico.clinica}</p>
      <p className="small muted">
        {medico.bairro} · {medico.cidade}/{medico.uf}
      </p>
      <div className="row between" style={{ marginTop: 12 }}>
        <span className="small mono">
          {brl(medico.valorCentavos)} <span className="muted">· {medico.duracaoMin} min</span>
        </span>
        <span className="pill neutral">{listaDeConvenios(medico.convenios).length} convênios</span>
      </div>
    </Link>
  );
}
