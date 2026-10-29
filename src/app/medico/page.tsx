import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { exigirPapel } from "@/lib/session";
import { Stat, SeloStatus } from "@/components/ui";
import { PLANOS, brl, dataCurta, diasPorExtenso, hoje } from "@/lib/domain";
import { cancelarConsulta } from "./actions";

export const dynamic = "force-dynamic";

export default async function PainelMedico({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string }>;
}) {
  const { enviado } = await searchParams;
  const usuario = await exigirPapel(["MEDICO"]);
  if (!usuario.medico) redirect("/medico/cadastro");

  const medico = usuario.medico;
  const hojeIso = hoje();

  const [doDia, futuras] = await Promise.all([
    db.consulta.findMany({
      where: { medicoId: medico.id, data: hojeIso, status: "CONFIRMADA" },
      orderBy: { hora: "asc" },
    }),
    db.consulta.findMany({
      where: { medicoId: medico.id, data: { gt: hojeIso }, status: "CONFIRMADA" },
      orderBy: [{ data: "asc" }, { hora: "asc" }],
      take: 20,
    }),
  ]);

  const mensalidade = PLANOS.find((p) => p.nome === medico.plano)?.centavos ?? 0;
  const publicada = medico.status === "APROVADO";

  return (
    <div className="view">
      {enviado && (
        <div className="card" style={{ borderColor: "var(--warn)" }}>
          <div className="row between">
            <div>
              <h3>Cadastro enviado para análise</h3>
              <p className="small muted" style={{ marginTop: 4 }}>
                Assim que o CRM e o endereço forem conferidos, sua página entra no ar e o link chega
                por e-mail.
              </p>
            </div>
            <SeloStatus status={medico.status} />
          </div>
        </div>
      )}

      <section className="row between">
        <div>
          <h2>{medico.clinica}</h2>
          <p className="muted small">
            {usuario.nome} · {medico.especialidade} · plano {medico.plano}
          </p>
        </div>
        <div className="row">
          <SeloStatus status={medico.status} />
          {publicada && (
            <Link className="btn ghost sm" href={`/clinica/${medico.slug}`}>
              Ver minha página pública
            </Link>
          )}
        </div>
      </section>

      {!publicada && (
        <div className="aviso">
          Sua clínica ainda não aparece na busca. Enquanto o cadastro estiver{" "}
          {medico.status === "PENDENTE" ? "em análise" : "suspenso"}, a página pública fica fora do
          ar e nenhum paciente consegue agendar.
        </div>
      )}

      <section className="grid cols-3">
        <Stat numero={doDia.length} rotulo="Consultas hoje" />
        <Stat numero={futuras.length} rotulo="Próximos dias" />
        <Stat numero={brl(doDia.length * medico.valorCentavos)} rotulo="Previsto hoje" />
      </section>

      <section>
        <h3>Agenda de hoje</h3>
        {doDia.length ? (
          <div className="tablewrap" style={{ marginTop: 10 }}>
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Convênio</th>
                  <th>Contato</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {doDia.map((c) => (
                  <tr key={c.id}>
                    <td className="mono">{c.hora}</td>
                    <td>{c.nome}</td>
                    <td>{c.convenio}</td>
                    <td className="mono small">{c.telefone}</td>
                    <td>
                      <form action={cancelarConsulta}>
                        <input type="hidden" name="id" value={c.id} />
                        <button className="btn ghost sm" type="submit">
                          Cancelar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted small card" style={{ marginTop: 10 }}>
            Nenhuma consulta marcada para hoje.
          </p>
        )}
      </section>

      <section>
        <h3>Próximas consultas</h3>
        {futuras.length ? (
          <div className="tablewrap" style={{ marginTop: 10 }}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Convênio</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {futuras.map((c) => (
                  <tr key={c.id}>
                    <td className="mono">{dataCurta(c.data)}</td>
                    <td className="mono">{c.hora}</td>
                    <td>{c.nome}</td>
                    <td>{c.convenio}</td>
                    <td>
                      <form action={cancelarConsulta}>
                        <input type="hidden" name="id" value={c.id} />
                        <button className="btn ghost sm" type="submit">
                          Cancelar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted small card" style={{ marginTop: 10 }}>
            Agenda livre nos próximos dias.
          </p>
        )}
      </section>

      <section className="card">
        <div className="row between">
          <div>
            <p className="eyebrow">Minha agenda publicada</p>
            <p className="small" style={{ marginTop: 4 }}>
              {diasPorExtenso(medico.diasSemana)} · {medico.horaInicio}h às {medico.horaFim}h ·
              consultas de {medico.duracaoMin} min · {brl(medico.valorCentavos)}
            </p>
          </div>
          <span className="pill neutral">
            Plano {medico.plano} · {brl(mensalidade)}/mês
          </span>
        </div>
      </section>
    </div>
  );
}
