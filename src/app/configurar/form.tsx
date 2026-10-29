"use client";

import Link from "next/link";
import { useActionState } from "react";
import { instalar, type EstadoInstalacao } from "./actions";

export default function FormularioInstalacao() {
  const [estado, enviar, enviando] = useActionState<EstadoInstalacao, FormData>(instalar, {});

  if (estado.pronto) {
    return (
      <div className="card grid" style={{ gap: 12 }}>
        <span className="pill ok" style={{ justifySelf: "start" }}>
          <span className="dot" />
          Instalado
        </span>
        <p className="small">
          Banco criado com {estado.pronto.medicos} médicos de exemplo, dois deles em análise.
        </p>
        <p className="small mono">
          admin@clinicaaberta.com.br
          <br />
          helena@corevida.com.br
          <br />
          ana@exemplo.com.br
        </p>
        <p className="small muted">Senha das três: {estado.pronto.senha}</p>
        <Link className="btn" href="/">
          Abrir o sistema
        </Link>
      </div>
    );
  }

  return (
    <form action={enviar} className="card grid" style={{ gap: 14 }}>
      <label className="f">
        Senha de instalação
        <input name="token" type="password" required placeholder="valor da variável SETUP_TOKEN" />
      </label>
      {estado.erro && <p className="erro">{estado.erro}</p>}
      <button className="btn" type="submit" disabled={enviando}>
        {enviando ? "Criando tabelas…" : "Criar tabelas e popular"}
      </button>
    </form>
  );
}
