import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { exigirPapel } from "@/lib/session";
import FormularioVagas from "./form-vagas";
import { criarBloqueio, removerBloqueio, removerDisponibilidade } from "../../actions";
import { DIAS_CURTOS, dataBR, hoje, turnoRotulo } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function UnidadeDaSecretaria({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirPapel(["SECRETARIA"], "/secretaria/unidades");
  const { id } = await params;

  const unidade = await db.unidade.findUnique({
    where: { id },
    include: {
      disponibilidades: { orderBy: [{ especialidade: "asc" }, { diaSemana: "asc" }] },
      bloqueios: { where: { data: { gte: hoje() } }, orderBy: { data: "asc" } },
    },
  });
  if (!unidade) notFound();

  const porEspecialidade = new Map<string, typeof unidade.disponibilidades>();
  for (const d of unidade.disponibilidades) {
    const atual = porEspecialidade.get(d.especialidade) ?? [];
    atual.push(d);
    porEspecialidade.set(d.especialidade, atual);
  }

  return (
    <div className="view">
      <Link className="btn ghost sm" href="/secretaria/unidades" style={{ justifySelf: "start" }}>
        ← Todas as unidades
      </Link>

      <section className="row between">
        <div>
          <h2>{unidade.nome}</h2>
          <p className="muted small">
            {unidade.tipo} · {unidade.endereco} · {unidade.bairro}
          </p>
        </div>
        <Link className="btn ghost sm" href={`/unidade/${unidade.slug}`}>
          Ver página pública
        </Link>
      </section>

      <section>
        <h3>Vagas abertas</h3>
        {porEspecialidade.size ? (
          <div className="grid" style={{ marginTop: 10 }}>
            {[...porEspecialidade.entries()].map(([especialidade, regras]) => (
              <div className="card" key={especialidade}>
                <h3>{especialidade}</h3>
                <div className="tablewrap" style={{ marginTop: 10 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Dia</th>
                        <th>Turno</th>
                        <th>Vagas</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {regras.map((r) => (
                        <tr key={r.id}>
                          <td>{DIAS_CURTOS[r.diaSemana]}</td>
                          <td>{turnoRotulo(r.turno)}</td>
                          <td className="mono">{r.vagas}</td>
                          <td>
                            <form action={removerDisponibilidade}>
                              <input type="hidden" name="id" value={r.id} />
                              <button className="btn ghost sm" type="submit">
                                Remover
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted small card" style={{ marginTop: 10 }}>
            Esta unidade ainda não abriu vagas. Use o formulário abaixo — enquanto não houver vagas,
            ela aparece na busca mas ninguém consegue agendar.
          </p>
        )}
      </section>

      <section>
        <h3>Abrir vagas</h3>
        <FormularioVagas unidadeId={unidade.id} />
      </section>

      <section>
        <h3>Dias fechados</h3>
        <p className="muted small" style={{ marginTop: 4 }}>
          Feriado, dedetização, falta de profissional. Nesses dias a unidade some da agenda.
        </p>

        {unidade.bloqueios.length > 0 && (
          <div className="tablewrap" style={{ marginTop: 10 }}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Motivo</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {unidade.bloqueios.map((b) => (
                  <tr key={b.id}>
                    <td className="mono">{dataBR(b.data)}</td>
                    <td>{b.motivo}</td>
                    <td>
                      <form action={removerBloqueio}>
                        <input type="hidden" name="id" value={b.id} />
                        <button className="btn ghost sm" type="submit">
                          Reabrir
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form action={criarBloqueio} className="card grid cols-3" style={{ marginTop: 10, gap: 12 }}>
          <input type="hidden" name="unidadeId" value={unidade.id} />
          <label className="f">
            Data
            <input name="data" type="date" required min={hoje()} />
          </label>
          <label className="f">
            Motivo
            <input name="motivo" placeholder="Feriado municipal" />
          </label>
          <button className="btn" type="submit" style={{ alignSelf: "end" }}>
            Fechar esse dia
          </button>
        </form>
      </section>
    </div>
  );
}
