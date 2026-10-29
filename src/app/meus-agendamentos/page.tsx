import Link from "next/link";
import { db } from "@/lib/db";
import { exigirPapel } from "@/lib/session";
import { SeloStatus } from "@/components/ui";
import { dataBR, diaPorExtenso, hoje, turnoFaixa, turnoRotulo } from "@/lib/domain";
import { cancelarAgendamento } from "./actions";

export const dynamic = "force-dynamic";

export default async function MeusAgendamentos() {
  const usuario = await exigirPapel(["CIDADAO"], "/meus-agendamentos");
  const hj = hoje();

  const agendamentos = await db.agendamento.findMany({
    where: { cidadaoId: usuario.id },
    include: { unidade: { select: { nome: true, endereco: true, bairro: true, slug: true } } },
    orderBy: [{ data: "desc" }],
    take: 40,
  });

  const proximos = agendamentos.filter((a) => a.data >= hj && a.status === "CONFIRMADO");
  const anteriores = agendamentos.filter((a) => !(a.data >= hj && a.status === "CONFIRMADO"));

  return (
    <div className="view">
      <section className="row between">
        <div>
          <h2>Meus agendamentos</h2>
          <p className="muted small">{usuario.nome}</p>
        </div>
        <Link className="btn sm" href="/unidades">
          Marcar nova consulta
        </Link>
      </section>

      <section>
        <h3>Próximos</h3>
        {proximos.length ? (
          <div className="grid" style={{ marginTop: 10 }}>
            {proximos.map((a) => (
              <div className="card" key={a.id}>
                <div className="row between" style={{ alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <h3>{a.especialidade}</h3>
                    <p className="small" style={{ color: "var(--brand)", fontWeight: 600 }}>
                      {a.unidade.nome}
                    </p>
                    <p className="small muted">
                      {a.unidade.endereco} · {a.unidade.bairro}
                    </p>
                  </div>
                  <SeloStatus status={a.status} />
                </div>

                <hr className="sep" style={{ margin: "12px 0" }} />

                <div className="row between">
                  <div>
                    <p className="small">
                      {diaPorExtenso(a.data)}, <strong>{dataBR(a.data)}</strong> · turno da{" "}
                      {turnoRotulo(a.turno).toLowerCase()} ({turnoFaixa(a.turno)})
                    </p>
                    <p className="small muted">
                      Protocolo <strong className="mono">{a.protocolo}</strong>
                    </p>
                  </div>
                  <form action={cancelarAgendamento}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="btn ghost sm" type="submit">
                      Cancelar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ marginTop: 10 }}>
            <p className="muted small">
              Você não tem consulta marcada. <Link href="/unidades">Veja as unidades</Link> para
              marcar.
            </p>
          </div>
        )}
      </section>

      {anteriores.length > 0 && (
        <section>
          <h3>Histórico</h3>
          <div className="tablewrap" style={{ marginTop: 10 }}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Especialidade</th>
                  <th>Unidade</th>
                  <th>Protocolo</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {anteriores.map((a) => (
                  <tr key={a.id}>
                    <td className="mono">{dataBR(a.data)}</td>
                    <td>{a.especialidade}</td>
                    <td>{a.unidade.nome}</td>
                    <td className="mono small">{a.protocolo}</td>
                    <td>
                      <SeloStatus status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="aviso">
        Se não puder comparecer, cancele com antecedência. A vaga volta para a fila e outro morador
        consegue usar.
      </section>
    </div>
  );
}
