import Link from "next/link";
import FormularioEntrar from "./form";

export default function Entrar() {
  return (
    <div className="view">
      <div className="auth">
        <div>
          <h1 style={{ fontSize: 30 }}>Entrar</h1>
          <p className="muted small" style={{ marginTop: 6 }}>
            Médicos acessam a agenda; a equipe acessa a fila de análise.
          </p>
        </div>

        <FormularioEntrar />

        <div className="card">
          <p className="eyebrow">Contas de teste do seed</p>
          <p className="small mono" style={{ marginTop: 8 }}>
            admin@clinicaaberta.com.br
            <br />
            helena@corevida.com.br
            <br />
            ana@exemplo.com.br
          </p>
          <p className="small muted" style={{ marginTop: 6 }}>
            Senha das três: senha123
          </p>
        </div>

        <p className="small muted" style={{ textAlign: "center" }}>
          Ainda não tem conta? <Link href="/criar-conta">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
