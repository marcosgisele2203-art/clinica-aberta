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
          Banco criado com {estado.pronto.unidades} unidades de exemplo, vagas abertas e alguns
          agendamentos.
        </p>
        <p className="small">Entre com um destes CPFs e a senha {estado.pronto.senha}:</p>
        <p className="small mono">
          111.444.777-35 — secretaria
          <br />
          529.982.247-25 — morador
        </p>
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
