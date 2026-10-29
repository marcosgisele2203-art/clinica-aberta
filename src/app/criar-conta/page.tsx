import Link from "next/link";
import FormularioConta from "./form";

export default async function CriarConta({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>;
}) {
  const { proximo = "" } = await searchParams;

  return (
    <div className="view">
      <div className="auth">
        <div>
          <h1 style={{ fontSize: 30 }}>Cadastro do morador</h1>
          <p className="muted small" style={{ marginTop: 6 }}>
            Uma vez só. Depois você marca consulta com CPF e senha, sem precisar repetir os dados.
          </p>
        </div>

        <FormularioConta proximo={proximo} />

        <p className="small muted" style={{ textAlign: "center" }}>
          Já tem cadastro?{" "}
          <Link href={`/entrar${proximo ? `?proximo=${encodeURIComponent(proximo)}` : ""}`}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
