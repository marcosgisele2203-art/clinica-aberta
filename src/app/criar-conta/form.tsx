"use client";

import { useActionState, useState } from "react";
import { criarConta, type EstadoAuth } from "@/lib/auth-actions";

export default function FormularioConta({ papelInicial }: { papelInicial: "PACIENTE" | "MEDICO" }) {
  const [papel, setPapel] = useState(papelInicial);
  const [estado, enviar, enviando] = useActionState<EstadoAuth, FormData>(criarConta, {});

  return (
    <form action={enviar} className="card grid" style={{ gap: 14 }}>
      <input type="hidden" name="papel" value={papel} />
      <div>
        <p className="eyebrow">Tipo de conta</p>
        <div className="chips" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="chip"
            aria-pressed={papel === "PACIENTE"}
            onClick={() => setPapel("PACIENTE")}
          >
            Sou paciente
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={papel === "MEDICO"}
            onClick={() => setPapel("MEDICO")}
          >
            Sou médico
          </button>
        </div>
      </div>
      <label className="f">
        Nome completo
        <input name="nome" required autoComplete="name" />
      </label>
      <label className="f">
        E-mail
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="f">
        Telefone
        <input name="telefone" placeholder="(00) 00000-0000" autoComplete="tel" />
      </label>
      <label className="f">
        Senha
        <input name="senha" type="password" required minLength={8} autoComplete="new-password" />
      </label>
      {estado.erro && <p className="erro">{estado.erro}</p>}
      <button className="btn" type="submit" disabled={enviando}>
        {enviando ? "Criando…" : "Criar conta"}
      </button>
    </form>
  );
}
