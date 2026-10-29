import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui";
import AgendarForm from "./agendar-form";
import {
  brl,
  diasPorExtenso,
  horariosDoDia,
  jaPassou,
  listaDeConvenios,
  proximasDatas,
} from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function PaginaClinica({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dia?: string }>;
}) {
  const { slug } = await params;
  const { dia } = await searchParams;

  const medico = await db.medico.findUnique({
    where: { slug },
    include: { user: { select: { nome: true } } },
  });
  if (!medico || medico.status !== "APROVADO") notFound();

  const datas = proximasDatas(medico.diasSemana, 7);
  const dataSelecionada = dia && datas.includes(dia) ? dia : (datas[0] ?? null);

  const ocupadas = dataSelecionada
    ? await db.consulta.findMany({
        where: { medicoId: medico.id, data: dataSelecionada, status: "CONFIRMADA" },
        select: { hora: true },
      })
    : [];
  const tomadas = new Set(ocupadas.map((c) => c.hora));

  const horarios = dataSelecionada
    ? horariosDoDia(medico.horaInicio, medico.horaFim, medico.duracaoMin).map((hora) => ({
        hora,
        livre: !tomadas.has(hora) && !jaPassou(dataSelecionada, hora),
      }))
    : [];

  const convenios = listaDeConvenios(medico.convenios);

  return (
    <div className="view">
      <Link className="btn ghost sm" href="/buscar" style={{ justifySelf: "start" }}>
        ← Voltar para a busca
      </Link>

      <section className="card">
        <div className="doc">
          <Avatar nome={medico.user.nome} grande />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ fontSize: "clamp(22px,4vw,32px)" }}>{medico.user.nome}</h1>
            <p style={{ color: "var(--brand)", fontWeight: 600 }}>{medico.especialidade}</p>
            <p className="small muted mono">
              CRM/{medico.crmUf} {medico.crm}
            </p>
            <div className="row" style={{ marginTop: 10 }}>
              <span className="pill ok">
                <span className="dot" />
                Clínica verificada
              </span>
              {medico.publicadoEm && (
                <span className="pill neutral">
                  No ar desde{" "}
                  {medico.publicadoEm.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>

        <hr className="sep" style={{ margin: "16px 0" }} />

        <div className="grid cols-2">
          <div>
            <p className="eyebrow">Sobre o atendimento</p>
            <p className="small" style={{ marginTop: 6 }}>
              {medico.bio || `Atendimento em ${medico.especialidade}.`}
            </p>
            <p className="eyebrow" style={{ marginTop: 14 }}>
              Convênios aceitos
            </p>
            <div className="chips" style={{ marginTop: 6 }}>
              {convenios.map((c) => (
                <span className="chip" key={c}>
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">{medico.clinica}</p>
            <p className="small" style={{ marginTop: 6 }}>
              {medico.endereco}
              <br />
              {medico.bairro} · {medico.cidade}/{medico.uf} · CEP {medico.cep}
            </p>
            <p className="small" style={{ marginTop: 10 }}>
              Consulta <strong className="mono">{brl(medico.valorCentavos)}</strong> ·{" "}
              {medico.duracaoMin} minutos
            </p>
            <p className="small muted">
              Atende {diasPorExtenso(medico.diasSemana)}, das {medico.horaInicio}h às{" "}
              {medico.horaFim}h
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Agendar consulta</h2>
        <p className="muted small" style={{ margin: "4px 0 14px" }}>
          Escolha o dia e um horário livre. Não precisa criar conta para marcar.
        </p>
        <AgendarForm
          slug={medico.slug}
          medicoNome={medico.user.nome}
          datas={datas}
          dataSelecionada={dataSelecionada}
          horarios={horarios}
          convenios={convenios}
        />
      </section>
    </div>
  );
}
