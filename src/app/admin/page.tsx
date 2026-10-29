import Link from "next/link";
import { db } from "@/lib/db";
import { exigirPapel } from "@/lib/session";
import { Avatar, SeloStatus, Stat } from "@/components/ui";
import { PLANOS, brl, diasPorExtenso } from "@/lib/domain";
import { aprovarClinica, reativarClinica, recusarClinica, suspenderClinica } from "./actions";

export const dynamic = "force-dynamic";

export default async function Admin() {
  await exigirPapel(["ADMIN"]);

  const [pendentes, publicadas, totalConsultas] = await Promise.all([
    db.medico.findMany({
      where: { status: "PENDENTE" },
      include: { user: { select: { nome: true, email: true, telefone: true } } },
      orderBy: { criadoEm: "asc" },
    }),
    db.medico.findMany({
      where: { status: { in: ["APROVADO", "SUSPENSO"] } },
      include: { user: { select: { nome: true } } },
      orderBy: { publicadoEm: "desc" },
    }),
    db.consulta.count({ where: { status: "CONFIRMADA" } }),
  ]);

  const noAr = publicadas.filter((m) => m.status === "APROVADO");
  const receita = noAr.reduce(
    (soma, m) => soma + (PLANOS.find((p) => p.nome === m.plano)?.centavos ?? 0),
    0
  );

  return (
    <div className="view">
      <section>
        <h2>Painel administrativo</h2>
        <p className="muted small" style={{ marginTop: 4 }}>
          Fila de análise, clínicas publicadas e receita de assinaturas.
        </p>
      </section>

      <section className="grid cols-3">
        <Stat numero={pendentes.length} rotulo="Aguardando análise" />
        <Stat numero={noAr.length} rotulo="Clínicas no ar" />
        <Stat numero={totalConsultas} rotulo="Agendamentos ativos" />
        <Stat numero={brl(receita)} rotulo="Receita mensal" />
      </section>

      <section>
        <h3>Fila de análise</h3>
        {pendentes.length ? (
          <div className="grid" style={{ marginTop: 10 }}>
            {pendentes.map((m) => (
              <div className="card" key={m.id}>
                <div className="row between" style={{ alignItems: "flex-start" }}>
                  <div className="doc">
                    <Avatar nome={m.user.nome} />
                    <div>
                      <h3>{m.user.nome}</h3>
                      <p className="small" style={{ color: "var(--brand)", fontWeight: 600 }}>
                        {m.especialidade}
                      </p>
                      <p className="small muted mono">
                        CRM/{m.crmUf} {m.crm}
                      </p>
                      <p className="small muted">
                        {m.user.email}
                        {m.user.telefone ? ` · ${m.user.telefone}` : ""}
                      </p>
                    </div>
                  </div>
                  <SeloStatus status={m.status} />
                </div>

                <hr className="sep" style={{ margin: "12px 0" }} />

                <p className="small">
                  <strong>{m.clinica}</strong> — {m.endereco}, {m.bairro}, {m.cidade}/{m.uf}
                </p>
                <p className="small muted">
                  {diasPorExtenso(m.diasSemana)} · {m.horaInicio}h–{m.horaFim}h · {m.duracaoMin} min
                  · {brl(m.valorCentavos)} · plano {m.plano}
                </p>
                {m.bio && (
                  <p className="small muted" style={{ marginTop: 6 }}>
                    {m.bio}
                  </p>
                )}

                <div className="row" style={{ marginTop: 12 }}>
                  <form action={aprovarClinica}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="btn sm" type="submit">
                      Aprovar e publicar
                    </button>
                  </form>
                  <form action={recusarClinica}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="btn ghost sm" type="submit">
                      Recusar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted small card" style={{ marginTop: 10 }}>
            Nada na fila. Todos os cadastros foram analisados.
          </p>
        )}
      </section>

      <section>
        <h3>Clínicas cadastradas</h3>
        <div className="tablewrap" style={{ marginTop: 10 }}>
          <table>
            <thead>
              <tr>
                <th>Médico</th>
                <th>Especialidade</th>
                <th>Cidade</th>
                <th>Plano</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {publicadas.map((m) => (
                <tr key={m.id}>
                  <td>
                    {m.status === "APROVADO" ? (
                      <Link href={`/clinica/${m.slug}`}>{m.user.nome}</Link>
                    ) : (
                      m.user.nome
                    )}
                  </td>
                  <td>{m.especialidade}</td>
                  <td>
                    {m.cidade}/{m.uf}
                  </td>
                  <td className="mono small">{m.plano}</td>
                  <td>
                    <SeloStatus status={m.status} />
                  </td>
                  <td>
                    {m.status === "APROVADO" ? (
                      <form action={suspenderClinica}>
                        <input type="hidden" name="id" value={m.id} />
                        <button className="btn ghost sm" type="submit">
                          Suspender
                        </button>
                      </form>
                    ) : (
                      <form action={reativarClinica}>
                        <input type="hidden" name="id" value={m.id} />
                        <button className="btn ghost sm" type="submit">
                          Reativar
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {publicadas.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted small">
                    Nenhuma clínica cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
