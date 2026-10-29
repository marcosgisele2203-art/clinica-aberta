import Link from "next/link";
import { db } from "@/lib/db";
import { exigirPapel } from "@/lib/session";
import FormularioUnidade from "./form";
import { alternarUnidade } from "../actions";

export const dynamic = "force-dynamic";

export default async function UnidadesDaSecretaria() {
  await exigirPapel(["SECRETARIA"], "/secretaria/unidades");

  const unidades = await db.unidade.findMany({
    include: {
      disponibilidades: { where: { ativa: true }, select: { especialidade: true, vagas: true } },
    },
    orderBy: [{ ativa: "desc" }, { nome: "asc" }],
  });

  return (
    <div className="view">
      <section className="row between">
        <div>
          <h2>Unidades</h2>
          <p className="muted small">Cadastre os postos e defina quantas vagas cada um abre.</p>
        </div>
        <Link className="btn ghost sm" href="/secretaria">
          Voltar ao painel
        </Link>
      </section>

      <section className="grid">
        {unidades.map((u) => {
          const especialidades = [...new Set(u.disponibilidades.map((d) => d.especialidade))];
          const vagasSemana = u.disponibilidades.reduce((s, d) => s + d.vagas, 0);
          return (
            <div className="card" key={u.id}>
              <div className="row between" style={{ alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <h3>{u.nome}</h3>
                  <p className="small" style={{ color: "var(--brand)", fontWeight: 600 }}>
                    {u.tipo} · {u.bairro}
                  </p>
                  <p className="small muted">
                    {u.endereco} · {u.cidade}/{u.uf}
                  </p>
                </div>
                <span className={`pill ${u.ativa ? "ok" : "neutral"}`}>
                  <span className="dot" />
                  {u.ativa ? "No ar" : "Desativada"}
                </span>
              </div>

              <hr className="sep" style={{ margin: "12px 0" }} />

              <p className="small">
                {especialidades.length} especialidade{especialidades.length === 1 ? "" : "s"} ·{" "}
                <span className="mono">{vagasSemana}</span> vagas por semana
              </p>
              {especialidades.length > 0 && (
                <p className="small muted">{especialidades.sort().join(", ")}</p>
              )}

              <div className="row" style={{ marginTop: 12 }}>
                <Link className="btn sm" href={`/secretaria/unidades/${u.id}`}>
                  Vagas e bloqueios
                </Link>
                <Link className="btn ghost sm" href={`/unidade/${u.slug}`}>
                  Ver como o morador vê
                </Link>
                <form action={alternarUnidade}>
                  <input type="hidden" name="id" value={u.id} />
                  <button className="btn ghost sm" type="submit">
                    {u.ativa ? "Desativar" : "Reativar"}
                  </button>
                </form>
              </div>
            </div>
          );
        })}
        {unidades.length === 0 && (
          <div className="card">
            <p className="muted small">Nenhuma unidade cadastrada ainda. Use o formulário abaixo.</p>
          </div>
        )}
      </section>

      <section>
        <h3>Cadastrar nova unidade</h3>
        <FormularioUnidade />
      </section>
    </div>
  );
}
