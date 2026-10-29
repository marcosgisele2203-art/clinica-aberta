import Link from "next/link";
import FormularioConta from "./form";

export default async function CriarConta({
  searchParams,
}: {
  searchParams: Promise<{ papel?: string }>;
}) {
  const { papel } = await searchParams;
  const medico = papel === "MEDICO";

  return (
    <div className="view">
      <div className="auth">
        <div>
          <h1 style={{ fontSize: 30 }}>Criar conta</h1>
          <p className="muted small" style={{ marginTop: 6 }}>
            {medico
              ? "Depois da conta criada você preenche os dados da clínica e envia para análise."
              : "Dá para marcar consulta sem conta. Com conta, você vê seus agendamentos reunidos."}
          </p>
        </div>

        <FormularioConta papelInicial={medico ? "MEDICO" : "PACIENTE"} />

        <p className="small muted" style={{ textAlign: "center" }}>
          Já tem conta? <Link href="/entrar">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
