import Link from "next/link";
import { db } from "@/lib/db";
import { exigirPapel } from "@/lib/session";
import { SeloStatus } from "@/components/ui";
import { marcarPresenca } from "../actions";
import {
  cpfMascarado,
  dataBR,
  diaPorExtenso,
  formatarTelefone,
  hoje,
  idade,
  turnoRotulo,
} from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function AgendaDoDia({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; unidade?: string }>;
}) {
  await exigirPapel(["SECRETARIA"], "/secretaria/agenda");
  const { data, unidade } = await searchParams;

  const dia = data && /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : hoje();

  const unidades = await db.unidade.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  const agendamentos = await db.agendamento.findMany({
    where: { data: dia, ...(unidade ? { unidadeId: unidade } : {}) },
    include: {
      unidade: { select: { nome: true } },
      cidadao: { select: { nome: true, cpf: true, cns: true, telefone: true, nascimento: true } },
    },
    orderBy: [{ turno: "asc" }, { especialidade: "asc" }],
  });

  const presentes = agendamentos.filter((a) => a.status === "COMPARECEU").length;
  const faltantes = agendamentos.filter((a) => a.status === "FALTOU").length;

  return (
    <div className="view">
      <section className="row between">
        <div>
          <h2>Agenda do dia</h2>
          <p className="muted small">
            {diaPorExtenso(dia)}, {dataBR(dia)} · {agendamentos.length} agendamento
            {agendamentos.length === 1 ? "" : "s"}
            {agendamentos.length > 0 && ` · ${presentes} compareceram, ${faltantes} faltaram`}
          </p>
        </div>
        <Link className="btn ghost sm" href="/secretaria">
          Voltar ao painel
        </Link>
      </section>

      <section className="card">
        <form className="searchbar">
          <label className="f">
            Data
            <input name="data" type="date" defaultValue={dia} />
          </label>
          <label className="f">
            Unidade
            <select name="unidade" defaultValue={unidade ?? ""}>
              <option value="">Todas</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </label>
          <button className="btn" type="submit">
            Ver agenda
          </button>
        </form>
      </section>

      {agendamentos.length ? (
        <section className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Turno</th>
                <th>Paciente</th>
                <th>Documento</th>
                <th>Especialidade</th>
                <th>Unidade</th>
                <th>Protocolo</th>
                <th>Situação</th>
                <th>Registrar</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.map((a) => (
                <tr key={a.id}>
                  <td>{turnoRotulo(a.turno)}</td>
                  <td>
                    {a.cidadao.nome}
                    <br />
                    <span className="small muted">
                      {idade(a.cidadao.nascimento)} anos
                      {a.cidadao.telefone ? ` · ${formatarTelefone(a.cidadao.telefone)}` : ""}
                    </span>
                  </td>
                  <td className="mono small">
                    {cpfMascarado(a.cidadao.cpf)}
                    {a.cidadao.cns ? (
                      <>
                        <br />
                        SUS {a.cidadao.cns.slice(-4)}
                      </>
                    ) : null}
                  </td>
                  <td>
                    {a.especialidade}
                    {a.observacao ? (
                      <>
                        <br />
                        <span className="small muted">{a.observacao}</span>
                      </>
                    ) : null}
                  </td>
                  <td className="small">{a.unidade.nome}</td>
                  <td className="mono small">{a.protocolo}</td>
                  <td>
                    <SeloStatus status={a.status} />
                  </td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <form action={marcarPresenca}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="COMPARECEU" />
                        <button className="btn sm" type="submit">
                          Veio
                        </button>
                      </form>
                      <form action={marcarPresenca}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="FALTOU" />
                        <button className="btn ghost sm" type="submit">
                          Faltou
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="card" style={{ textAlign: "center", padding: "40px 18px" }}>
          <h3>Nenhum agendamento nesse dia</h3>
          <p className="muted small" style={{ marginTop: 6 }}>
            Troque a data ou a unidade no filtro acima.
          </p>
        </section>
      )}

      <section className="aviso">
        O CPF aparece parcial de propósito: serve para conferir com o documento na mão, sem expor o
        número inteiro na tela da recepção.
      </section>
    </div>
  );
}
