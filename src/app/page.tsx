import Link from "next/link";
import { db } from "@/lib/db";
import { CartaoMedico } from "@/components/ui";
import { CONVENIOS, ESPECIALIDADES, PLANOS, brl } from "@/lib/domain";

// Lê o banco a cada acesso: nada de consultar na hora do build, quando as tabelas
// ainda podem não existir.
export const dynamic = "force-dynamic";

export default async function Inicio() {
  const destaques = await db.medico.findMany({
    where: { status: "APROVADO" },
    include: { user: { select: { nome: true } } },
    orderBy: { publicadoEm: "desc" },
    take: 3,
  });

  return (
    <div className="view">
      <section className="hero">
        <p className="eyebrow">Consultórios e clínicas verificados pelo CRM</p>
        <h1>O consultório do seu médico, aberto na internet</h1>
        <p className="lead">
          O médico cadastra a clínica, define os horários e recebe agendamentos direto na página. O
          paciente procura por especialidade e cidade, vê o valor da consulta e marca em dois toques.
        </p>
        <form action="/buscar" className="searchbar">
          <label className="f">
            Especialidade
            <select name="esp" defaultValue="">
              <option value="">Todas</option>
              {ESPECIALIDADES.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </label>
          <label className="f">
            Cidade
            <input name="cidade" placeholder="Campo Grande, Curitiba…" />
          </label>
          <label className="f">
            Convênio
            <select name="convenio" defaultValue="">
              <option value="">Qualquer</option>
              {CONVENIOS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button className="btn" type="submit">
            Buscar médicos
          </button>
        </form>
      </section>

      <section className="grid cols-3">
        <div className="card">
          <h3>Para o paciente</h3>
          <p className="muted small" style={{ marginTop: 6 }}>
            Busca por especialidade, cidade e convênio, com valor da consulta e endereço completo
            antes de marcar.
          </p>
        </div>
        <div className="card">
          <h3>Para o médico</h3>
          <p className="muted small" style={{ marginTop: 6 }}>
            Cadastro com CRM, página pública da clínica, agenda com duração de consulta configurável
            e painel de atendimentos.
          </p>
        </div>
        <div className="card">
          <h3>Para quem administra</h3>
          <p className="muted small" style={{ marginTop: 6 }}>
            Fila de aprovação dos cadastros e cobrança mensal por plano. Nada entra no ar sem passar
            pela análise.
          </p>
        </div>
      </section>

      {destaques.length > 0 && (
        <section>
          <div className="row between" style={{ marginBottom: 12 }}>
            <h2>Clínicas no ar</h2>
            <Link className="btn ghost sm" href="/buscar">
              Ver todas
            </Link>
          </div>
          <div className="grid cols-3">
            {destaques.map((m) => (
              <CartaoMedico key={m.id} medico={m} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2>Planos para o médico</h2>
          <Link className="btn sm" href="/medico/cadastro">
            Cadastrar minha clínica
          </Link>
        </div>
        <div className="grid cols-3">
          {PLANOS.map((p) => (
            <div key={p.nome} className={p.nome === "Profissional" ? "plan featured" : "plan"}>
              {p.nome === "Profissional" && (
                <span className="pill ok" style={{ justifySelf: "start" }}>
                  Mais escolhido
                </span>
              )}
              <h3>{p.nome}</h3>
              <p className="p">
                {brl(p.centavos)} <span className="muted" style={{ fontSize: 14 }}>/mês</span>
              </p>
              <p className="small muted">{p.resumo}</p>
              <Link className={p.nome === "Profissional" ? "btn" : "btn ghost"} href={`/medico/cadastro?plano=${p.nome}`}>
                Começar com o {p.nome}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
