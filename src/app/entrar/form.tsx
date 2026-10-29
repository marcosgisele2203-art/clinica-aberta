"use client";

import { useActionState } from "react";
import { entrar, type EstadoAuth } from "@/lib/auth-actions";

export default function FormularioEntrar() {
  const [estado, enviar, enviando] = useActionState<EstadoAuth, FormData>(entrar, {});

  return (
    <form action={enviar} className="card grid" style={{ gap: 14 }}>
      <label className="f">
        E-mail
        <input name="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com.br" />
      </label>
      <label className="f">
        Senha
        <input name="senha" type="password" required autoComplete="current-password" />
      </label>
      {estado.erro && <p className="erro">{estado.erro}</p>}
      <button className="btn" type="submit" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
