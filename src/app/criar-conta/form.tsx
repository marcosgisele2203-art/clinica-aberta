"use client";

import { useActionState } from "react";
import { criarConta, type EstadoAuth } from "@/lib/auth-actions";

export default function FormularioConta({ proximo }: { proximo: string }) {
  const [estado, enviar, enviando] = useActionState<EstadoAuth, FormData>(criarConta, {});

  return (
    <form action={enviar} className="card grid" style={{ gap: 14 }}>
      <input type="hidden" name="proximo" value={proximo} />
      <label className="f">
        Nome completo
        <input name="nome" required autoComplete="name" placeholder="Como está no documento" />
      </label>
      <label className="f">
        CPF
        <input name="cpf" required inputMode="numeric" placeholder="000.000.000-00" />
      </label>
      <label className="f">
        Data de nascimento
        <input name="nascimento" type="date" required />
      </label>
      <label className="f">
        Cartão SUS (se souber)
        <input name="cns" inputMode="numeric" placeholder="15 números" />
      </label>
      <label className="f">
        Telefone com WhatsApp
        <input name="telefone" inputMode="tel" placeholder="(00) 00000-0000" autoComplete="tel" />
      </label>
      <label className="f">
        Crie uma senha
        <input name="senha" type="password" required minLength={6} autoComplete="new-password" />
      </label>
      {estado.erro && <p className="erro">{estado.erro}</p>}
      <button className="btn" type="submit" disabled={enviando}>
        {enviando ? "Cadastrando…" : "Criar cadastro"}
      </button>
      <p className="small muted">
        Seus dados são usados só para o agendamento na rede municipal de saúde.
      </p>
    </form>
  );
}
