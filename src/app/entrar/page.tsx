import Link from "next/link";
import FormularioEntrar from "./form";

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>;
}) {
  const { proximo = "" } = await searchParams;

  return (
    <div className="view">
      <div className="auth">
        <div>
          <h1 style={{ fontSize: 30 }}>Entrar</h1>
          <p className="muted small" style={{ marginTop: 6 }}>
            Use o CPF do paciente e a senha criada no cadastro.
          </p>
        </div>

        <FormularioEntrar proximo={proximo} />

        <p className="small muted" style={{ textAlign: "center" }}>
          Ainda não tem cadastro?{" "}
          <Link href={`/criar-conta${proximo ? `?proximo=${encodeURIComponent(proximo)}` : ""}`}>
            Cadastre-se
          </Link>
        </p>

        <div className="card">
          <p className="eyebrow">Acesso de demonstração</p>
          <p className="small mono" style={{ marginTop: 8 }}>
            Secretaria: 111.444.777-35
            <br />
            Morador: 529.982.247-25
          </p>
          <p className="small muted" style={{ marginTop: 6 }}>
            Senha dos dois: senha123. Apague este bloco antes de usar com a população.
          </p>
        </div>
      </div>
    </div>
  );
}
