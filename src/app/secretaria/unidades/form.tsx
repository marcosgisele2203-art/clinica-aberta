"use client";

import { useActionState } from "react";
import { criarUnidade, type EstadoUnidade } from "../actions";
import { TIPOS_UNIDADE, UFS } from "@/lib/domain";

export default function FormularioUnidade() {
  const [estado, enviar, enviando] = useActionState<EstadoUnidade, FormData>(criarUnidade, {});

  return (
    <form action={enviar} className="card grid" style={{ gap: 14, marginTop: 10 }}>
      <div className="grid cols-2">
        <label className="f">
          Nome da unidade
          <input name="nome" required placeholder="Ex.: UBS Centro" />
        </label>
        <label className="f">
          Tipo
          <select name="tipo" defaultValue="UBS">
            {TIPOS_UNIDADE.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="f">
          Endereço e número
          <input name="endereco" required />
        </label>
        <label className="f">
          Bairro
          <input name="bairro" required />
        </label>
        <label className="f">
          Cidade
          <input name="cidade" required />
        </label>
        <label className="f">
          UF
          <select name="uf" defaultValue="MS">
            {UFS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </label>
        <label className="f">
          Telefone
          <input name="telefone" placeholder="(00) 0000-0000" />
        </label>
        <label className="f">
          Funcionamento
          <input name="funcionamento" placeholder="Segunda a sexta, das 7h às 17h" />
        </label>
      </div>
      <label className="f">
        Aviso para o morador
        <textarea name="observacao" placeholder="O que levar, se precisa de encaminhamento, jejum para exames." />
      </label>
      {estado.erro && <p className="erro">{estado.erro}</p>}
      <button className="btn" type="submit" disabled={enviando} style={{ justifySelf: "start" }}>
        {enviando ? "Cadastrando…" : "Cadastrar unidade"}
      </button>
    </form>
  );
}
