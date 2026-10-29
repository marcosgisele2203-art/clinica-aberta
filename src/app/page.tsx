import Link from "next/link";
import { db } from "@/lib/db";
import { CartaoUnidade } from "@/components/ui";
import { ESPECIALIDADES } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function Inicio() {
  const unidades = await db.unidade.findMany({
    where: { ativa: true },
    include: { disponibilidades: { where: { ativa: true }, select: { especialidade: true } } },
    orderBy: { nome: "asc" },
    take: 3,
  });

  const lista = unidades.map((u) => ({
    ...u,
    especialidades: [...new Set(u.disponibilidades.map((d) => d.especialidade))].sort(),
  }));

  return (
    <div className="view">
      <section className="hero">
        <p className="eyebrow">Secretaria Municipal de Saúde</p>
        <h1>Marque sua consulta no posto sem precisar ir até lá</h1>
        <p className="lead">
          Escolha a unidade, a especialidade e o dia. Você recebe um número de protocolo e é só
          chegar no turno marcado com documento e cartão SUS. Sem fila na madrugada para pegar
          ficha.
        </p>
        <div className="row">
          <Link className="btn" href="/unidades">
            Ver unidades e vagas
          </Link>
          <Link className="btn ghost" href="/criar-conta">
            Fazer meu cadastro
          </Link>
        </div>
      </section>

      <section className="grid cols-3">
        <div className="card">
          <p className="mono" style={{ color: "var(--sand)", fontSize: 13 }}>01</p>
          <h3 style={{ marginTop: 4 }}>Cadastre-se com o CPF</h3>
          <p className="muted small" style={{ marginTop: 6 }}>
            Uma vez só. Depois é só entrar com CPF e senha para marcar quantas vezes precisar.
          </p>
        </div>
        <div className="card">
          <p className="mono" style={{ color: "var(--sand)", fontSize: 13 }}>02</p>
          <h3 style={{ marginTop: 4 }}>Escolha unidade e dia</h3>
          <p className="muted small" style={{ marginTop: 6 }}>
            O site mostra quantas vagas restam em cada turno. Se acabou, aparece o próximo dia com
            vaga.
          </p>
        </div>
        <div className="card">
          <p className="mono" style={{ color: "var(--sand)", fontSize: 13 }}>03</p>
          <h3 style={{ marginTop: 4 }}>Guarde o protocolo</h3>
          <p className="muted small" style={{ marginTop: 6 }}>
            Apresente o número na recepção. Se não puder ir, cancele pelo site para liberar a vaga
            para outra pessoa.
          </p>
        </div>
      </section>

      {lista.length > 0 && (
        <section>
          <div className="row between" style={{ marginBottom: 12 }}>
            <h2>Unidades</h2>
            <Link className="btn ghost sm" href="/unidades">
              Ver todas
            </Link>
          </div>
          <div className="grid cols-3">
            {lista.map((u) => (
              <CartaoUnidade key={u.id} unidade={u} />
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <p className="eyebrow">O que dá para marcar</p>
        <div className="chips" style={{ marginTop: 10 }}>
          {ESPECIALIDADES.map((e) => (
            <Link className="chip" key={e} href={`/unidades?especialidade=${encodeURIComponent(e)}`}>
              {e}
            </Link>
          ))}
        </div>
        <p className="small muted" style={{ marginTop: 14 }}>
          Urgência e emergência não entram no agendamento: o pronto atendimento continua por ordem
          de chegada, 24 horas.
        </p>
      </section>
    </div>
  );
}
