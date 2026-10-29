import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { sessaoAtual } from "@/lib/session";
import AgendarForm, { type VagaDoDia } from "./agendar-form";
import { diaDaSemana, proximosDias } from "@/lib/domain";

export const dynamic = "force-dynamic";

const DIAS_A_FRENTE = 21;
const ATIVOS = ["CONFIRMADO", "COMPARECEU"];

export default async function PaginaUnidade({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ especialidade?: string }>;
}) {
  const { slug } = await params;
  const { especialidade } = await searchParams;

  const unidade = await db.unidade.findUnique({
    where: { slug },
    include: { disponibilidades: { where: { ativa: true } } },
  });
  if (!unidade || !unidade.ativa) notFound();

  const especialidades = [...new Set(unidade.disponibilidades.map((d) => d.especialidade))].sort();
  const escolhida = especialidade && especialidades.includes(especialidade) ? especialidade : null;

  let vagas: VagaDoDia[] = [];
  if (escolhida) {
    const datas = proximosDias(DIAS_A_FRENTE, 1);
    const bloqueios = await db.bloqueio.findMany({
      where: { unidadeId: unidade.id, data: { in: datas } },
      select: { data: true },
    });
    const fechados = new Set(bloqueios.map((b) => b.data));

    const marcados = await db.agendamento.groupBy({
      by: ["data", "turno"],
      where: {
        unidadeId: unidade.id,
        especialidade: escolhida,
        data: { in: datas },
        status: { in: ATIVOS },
      },
      _count: { _all: true },
    });
    const usados = new Map(marcados.map((m) => [`${m.data}|${m.turno}`, m._count._all]));

    const regras = unidade.disponibilidades.filter((d) => d.especialidade === escolhida);

    for (const data of datas) {
      if (fechados.has(data)) continue;
      const dia = diaDaSemana(data);
      for (const regra of regras.filter((r) => r.diaSemana === dia)) {
        const usadas = usados.get(`${data}|${regra.turno}`) ?? 0;
        vagas.push({
          data,
          turno: regra.turno,
          vagas: regra.vagas,
          restantes: Math.max(0, regra.vagas - usadas),
        });
      }
    }
    vagas = vagas.sort((a, b) => (a.data === b.data ? a.turno.localeCompare(b.turno) : a.data < b.data ? -1 : 1));
  }

  const sessao = await sessaoAtual();

  return (
    <div className="view">
      <Link className="btn ghost sm" href="/unidades" style={{ justifySelf: "start" }}>
        ← Todas as unidades
      </Link>

      <section className="card">
        <p className="eyebrow">{unidade.tipo}</p>
        <h1 style={{ fontSize: "clamp(22px,4vw,32px)", marginTop: 4 }}>{unidade.nome}</h1>
        <div className="grid cols-2" style={{ marginTop: 14 }}>
          <div>
            <p className="small">{unidade.endereco}</p>
            <p className="small muted">
              {unidade.bairro} · {unidade.cidade}/{unidade.uf}
            </p>
            {unidade.telefone && <p className="small mono" style={{ marginTop: 6 }}>{unidade.telefone}</p>}
          </div>
          <div>
            <p className="small">
              <strong>Funcionamento</strong>
            </p>
            <p className="small muted">{unidade.funcionamento}</p>
            {unidade.observacao && (
              <p className="small" style={{ marginTop: 8 }}>
                {unidade.observacao}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>O que você quer marcar?</h2>
        <div className="chips" style={{ marginTop: 12 }}>
          {especialidades.map((e) => (
            <Link
              key={e}
              className="chip"
              href={`/unidade/${unidade.slug}?especialidade=${encodeURIComponent(e)}`}
              aria-pressed={escolhida === e}
            >
              {e}
            </Link>
          ))}
        </div>
      </section>

      {escolhida ? (
        <section>
          <h2>Dias com vaga para {escolhida}</h2>
          <p className="muted small" style={{ margin: "4px 0 14px" }}>
            O número embaixo do turno é quantas vagas ainda restam.
          </p>
          <AgendarForm
            slug={unidade.slug}
            unidadeNome={unidade.nome}
            especialidade={escolhida}
            vagas={vagas}
            logado={sessao?.role === "CIDADAO"}
          />
        </section>
      ) : (
        <section className="aviso">
          Escolha uma especialidade acima para ver os dias e turnos com vaga.
        </section>
      )}
    </div>
  );
}
