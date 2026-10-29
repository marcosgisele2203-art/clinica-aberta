import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/session";
import Assistente from "./assistente";

export default async function CadastroClinica({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}) {
  const { plano } = await searchParams;
  const usuario = await usuarioAtual();

  if (!usuario) {
    return (
      <div className="view">
        <div className="auth">
          <h1 style={{ fontSize: 30 }}>Cadastrar clínica</h1>
          <p className="muted">
            Primeiro crie sua conta de médico. Depois você preenche os dados da clínica, define os
            horários e envia para análise.
          </p>
          <Link className="btn" href="/criar-conta?papel=MEDICO">
            Criar conta de médico
          </Link>
          <p className="small muted" style={{ textAlign: "center" }}>
            Já tem conta? <Link href="/entrar">Entrar</Link>
          </p>
        </div>
      </div>
    );
  }

  if (usuario.role !== "MEDICO") redirect("/");
  if (usuario.medico) redirect("/medico");

  return (
    <div className="view">
      <section>
        <h2>Cadastrar clínica</h2>
        <p className="muted small" style={{ marginTop: 4 }}>
          Os dados ficam visíveis na página pública, menos CPF e e-mail.
        </p>
      </section>
      <Assistente nome={usuario.nome} planoInicial={plano ?? "Profissional"} />
    </div>
  );
}
