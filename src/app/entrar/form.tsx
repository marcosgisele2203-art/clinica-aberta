"use client";

import { useActionState } from "react";
import { entrar, type EstadoAuth } from "@/lib/auth-actions";

export default function FormularioEntrar({ proximo }: { proximo: string }) {
  const [estado, enviar, enviando] = useActionState<EstadoAuth, FormData>(entrar, {});

  return (
    <form action={enviar} className="card grid" style={{ gap: 14 }}>
      <input type="hidden" name="proximo" value={proximo} />
      <label className="f">
        CPF
        <input
          name="cpf"
          required
          inputMode="numeric"
          autoComplete="username"
          placeholder="000.000.000-00"
        />
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
