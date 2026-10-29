import Link from "next/link";
import { db } from "@/lib/db";
import { exigirPapel } from "@/lib/session";
import { Stat } from "@/components/ui";
import { dataBR, hoje, proximosDias, turnoRotulo } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function PainelSecretaria() {
  await exigirPapel(["SECRETARIA"], "/secretaria");

  const hj = hoje();
  const proximosSete = proximosDias(7, 0);
  const inicio = proximosSete[0];
  const fim = proximosSete[proximosSete.length - 1];

  const [unidades, deHoje, daSemana, faltas, atendidos, porUnidade] = await Promise.all([
    db.unidade.count({ where: { ativa: true } }),
    db.agendamento.count({ where: { data: hj, status: "CONFIRMADO" } }),
    db.agendamento.count({ where: { data: { gte: inicio, lte: fim }, status: "CONFIRMADO" } }),
    db.agendamento.count({ where: { status: "FALTOU" } }),
    db.agendamento.count({ where: { status: "COMPARECEU" } }),
    db.agendamento.groupBy({
      by: ["unidadeId"],
      where: { data: { gte: inicio, lte: fim }, status: "CONFIRMADO" },
      _count: { _all: true },
    }),
  ]);

  const nomes = await db.unidade.findMany({ select: { id: true, nome: true, slug: true } });
  const nomePorId = new Map(nomes.map((u) => [u.id, u.nome]));

  const comparecimentos = atendidos + faltas;
  const taxaFalta = comparecimentos > 0 ? Math.round((faltas / comparecimentos) * 100) : 0;

  const agendaDeHoje = await db.agendamento.findMany({
    where: { data: hj, status: "CONFIRMADO" },
    include: { unidade: { select: { nome: true } } },
    orderBy: [{ turno: "asc" }],
    take: 8,
  });

  return (
    <div className="view">
      <section className="row between">
        <div>
          <h2>Secretaria de Saúde</h2>
          <p className="muted small">Visão geral da rede e dos agendamentos</p>
        </div>
        <div className="row">
          <Link className="btn ghost sm" href="/secretaria/unidades">
            Unidades e vagas
          </Link>
          <Link className="btn sm" href="/secretaria/agenda">
            Agenda do dia
          </Link>
        </div>
      </section>

      <section className="grid cols-3">
        <Stat numero={unidades} rotulo="Unidades ativas" />
        <Stat numero={deHoje} rotulo="Agendados para hoje" />
        <Stat numero={daSemana} rotulo="Próximos 7 dias" />
        <Stat numero={`${taxaFalta}%`} rotulo="Faltas registradas" />
      </section>

      <section>
        <h3>Procura por unidade, próximos 7 dias</h3>
        {porUnidade.length ? (
          <div className="tablewrap" style={{ marginTop: 10 }}>
            <table>
              <thead>
                <tr>
                  <th>Unidade</th>
                  <th>Agendamentos</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {porUnidade
                  .sort((a, b) => b._count._all - a._count._all)
                  .map((linha) => (
                    <tr key={linha.unidadeId}>
                      <td>{nomePorId.get(linha.unidadeId) ?? "—"}</td>
                      <td className="mono">{linha._count._all}</td>
                      <td>
                        <Link className="btn ghost sm" href={`/secretaria/unidades/${linha.unidadeId}`}>
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted small card" style={{ marginTop: 10 }}>
            Nenhum agendamento nos próximos sete dias.
          </p>
        )}
      </section>

      <section>
        <h3>Hoje, {dataBR(hj)}</h3>
        {agendaDeHoje.length ? (
          <div className="tablewrap" style={{ marginTop: 10 }}>
            <table>
              <thead>
                <tr>
                  <th>Turno</th>
                  <th>Unidade</th>
                  <th>Especialidade</th>
                  <th>Protocolo</th>
                </tr>
              </thead>
              <tbody>
                {agendaDeHoje.map((a) => (
                  <tr key={a.id}>
                    <td>{turnoRotulo(a.turno)}</td>
                    <td>{a.unidade.nome}</td>
                    <td>{a.especialidade}</td>
                    <td className="mono small">{a.protocolo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted small card" style={{ marginTop: 10 }}>
            Nada marcado para hoje.
          </p>
        )}
        <p className="small muted" style={{ marginTop: 10 }}>
          Para registrar quem compareceu, use a <Link href="/secretaria/agenda">agenda do dia</Link>.
        </p>
      </section>
    </div>
  );
}
