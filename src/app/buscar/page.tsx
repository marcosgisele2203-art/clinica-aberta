import Link from "next/link";
import { db } from "@/lib/db";
import { CartaoMedico } from "@/components/ui";
import { CONVENIOS, ESPECIALIDADES } from "@/lib/domain";

type Busca = { termo?: string; esp?: string; cidade?: string; convenio?: string };

export default async function Buscar({
  searchParams,
}: {
  searchParams: Promise<Busca>;
}) {
  const { termo = "", esp = "", cidade = "", convenio = "" } = await searchParams;

  const medicos = await db.medico.findMany({
    where: {
      status: "APROVADO",
      ...(esp ? { especialidade: esp } : {}),
      ...(convenio ? { convenios: { contains: convenio } } : {}),
      ...(cidade
        ? { OR: [{ cidade: { contains: cidade } }, { uf: { contains: cidade.toUpperCase() } }] }
        : {}),
      ...(termo
        ? {
            OR: [
              { clinica: { contains: termo } },
              { especialidade: { contains: termo } },
              { user: { nome: { contains: termo } } },
            ],
          }
        : {}),
    },
    include: { user: { select: { nome: true } } },
    orderBy: [{ plano: "asc" }, { publicadoEm: "desc" }],
  });

  return (
    <div className="view">
      <section>
        <h2>Encontre um médico</h2>
        <p className="muted small" style={{ marginTop: 4 }}>
          {medicos.length} profissional{medicos.length === 1 ? "" : "is"} com clínica aprovada.
        </p>
      </section>

      <section className="card">
        <form className="searchbar">
          <label className="f">
            Nome ou clínica
            <input name="termo" defaultValue={termo} placeholder="Ex.: Helena, Cor &amp; Vida" />
          </label>
          <label className="f">
            Especialidade
            <select name="esp" defaultValue={esp}>
              <option value="">Todas</option>
              {ESPECIALIDADES.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </label>
          <label className="f">
            Cidade
            <input name="cidade" defaultValue={cidade} placeholder="Cidade ou UF" />
          </label>
          <label className="f">
            Convênio
            <select name="convenio" defaultValue={convenio}>
              <option value="">Qualquer</option>
              {CONVENIOS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button className="btn" type="submit">
            Filtrar
          </button>
        </form>
      </section>

      {medicos.length ? (
        <section className="grid cols-3">
          {medicos.map((m) => (
            <CartaoMedico key={m.id} medico={m} />
          ))}
        </section>
      ) : (
        <section className="card" style={{ textAlign: "center", padding: "40px 18px" }}>
          <h3>Nenhum médico com esses filtros</h3>
          <p className="muted small" style={{ marginTop: 6 }}>
            Tente limpar a cidade ou o convênio.
          </p>
          <Link className="btn ghost sm" href="/buscar" style={{ marginTop: 14 }}>
            Limpar filtros
          </Link>
        </section>
      )}
    </div>
  );
}
