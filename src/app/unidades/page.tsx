import Link from "next/link";
import { db } from "@/lib/db";
import { CartaoUnidade } from "@/components/ui";
import { ESPECIALIDADES } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function Unidades({
  searchParams,
}: {
  searchParams: Promise<{ especialidade?: string; bairro?: string }>;
}) {
  const { especialidade = "", bairro = "" } = await searchParams;

  const unidades = await db.unidade.findMany({
    where: {
      ativa: true,
      ...(bairro ? { bairro: { contains: bairro, mode: "insensitive" as const } } : {}),
      ...(especialidade
        ? { disponibilidades: { some: { especialidade, ativa: true } } }
        : {}),
    },
    include: { disponibilidades: { where: { ativa: true }, select: { especialidade: true } } },
    orderBy: { nome: "asc" },
  });

  const lista = unidades.map((u) => ({
    ...u,
    especialidades: [...new Set(u.disponibilidades.map((d) => d.especialidade))].sort(),
  }));

  return (
    <div className="view">
      <section>
        <h2>Unidades de saúde</h2>
        <p className="muted small" style={{ marginTop: 4 }}>
          {lista.length} unidade{lista.length === 1 ? "" : "s"} atendendo
          {especialidade ? ` em ${especialidade}` : ""}.
        </p>
      </section>

      <section className="card">
        <p className="eyebrow">Filtrar por especialidade</p>
        <div className="chips" style={{ marginTop: 10 }}>
          <Link className="chip" href="/unidades" aria-pressed={!especialidade}>
            Todas
          </Link>
          {ESPECIALIDADES.map((e) => (
            <Link
              className="chip"
              key={e}
              href={`/unidades?especialidade=${encodeURIComponent(e)}`}
              aria-pressed={especialidade === e}
            >
              {e}
            </Link>
          ))}
        </div>
      </section>

      {lista.length ? (
        <section className="grid cols-3">
          {lista.map((u) => (
            <CartaoUnidade key={u.id} unidade={u} />
          ))}
        </section>
      ) : (
        <section className="card" style={{ textAlign: "center", padding: "40px 18px" }}>
          <h3>Nenhuma unidade com esse filtro</h3>
          <p className="muted small" style={{ marginTop: 6 }}>
            Nenhuma unidade está oferecendo {especialidade || "esse atendimento"} no momento.
          </p>
          <Link className="btn ghost sm" href="/unidades" style={{ marginTop: 14 }}>
            Ver todas as unidades
          </Link>
        </section>
      )}
    </div>
  );
}
