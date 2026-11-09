# Instruções para agentes (Codex, Claude Code e outros)

Este arquivo vale para **qualquer agente de IA** que trabalhe neste repositório.
O `CLAUDE.md` só importa este arquivo, então mantenha as regras **aqui**.

## O projeto

**Agenda Saúde**: agendamento de consultas nas unidades básicas de saúde de um município. O morador marca
pelo site; a secretaria de saúde cadastra unidades, abre vagas e registra comparecimento.
Detalhes no `README.md` (inclusive a seção "Antes de usar com a população").

Stack: **Next.js 15 (App Router) + React 19 + TypeScript + Prisma + Postgres**. Sessão por cookie
assinado (`jose`) e senhas com `bcryptjs`. **Sem Tailwind**: o CSS é próprio (`src/app/globals.css`).
Node 20 (`.nvmrc`). **Não adicione bibliotecas sem pedir ao dono.**

| Caminho | O que é |
|---|---|
| `prisma/schema.prisma` | Modelos: Usuario, Unidade, Disponibilidade, Bloqueio, Agendamento |
| `src/lib/schema-sql.ts` | A **mesma** estrutura em SQL puro, usada pela tela `/configurar` |
| `src/lib/domain.ts` | Especialidades, turnos, datas no fuso certo, validação de CPF |
| `src/lib/session.ts` | Cookie de sessão, `usuarioAtual`, `exigirPapel` |
| `src/app/...` | Páginas e server actions (`actions.ts`) |

## Comandos

```bash
npm ci
cp .env.example .env          # DATABASE_URL, AUTH_SECRET, SETUP_TOKEN
npx prisma generate
npx tsc --noEmit              # checagem de tipos (não há testes automatizados ainda)
npx prisma db push && npm run db:seed   # só com banco local/descartável
npm run dev
npm run build                 # o build de produção precisa passar
```

Antes de abrir um PR: `npx tsc --noEmit` sem erros e `npm run build` funcionando.

## Regras do código

- **Duas definições do banco:** ao mudar `prisma/schema.prisma`, atualize `src/lib/schema-sql.ts` no
  mesmo PR. Nunca apague dados existentes.
- **Fuso horário:** todas as datas usam `America/Campo_Grande` (helpers em `src/lib/domain.ts`).
  Nunca use o relógio/fuso do servidor para decidir o dia.
- **Regras no servidor:** conferência de vaga dentro de transação, dia/turno validados contra as vagas reais,
  sem dois agendamentos futuros da mesma especialidade, sem agendamento para o mesmo dia.
  Preserve tudo isso nas server actions, não só na tela.
- **Permissões:** área da secretaria protegida com `exigirPapel` no servidor.
- **LGPD:** há CPF e dado de saúde (dado pessoal sensível). Não registre CPF em logs, não exponha dados
  de um morador para outro, e não envie esses dados a serviços externos.
- **Idioma:** código, textos, commits e PRs em **português do Brasil**, seguindo o estilo existente.

## Fluxo de trabalho (equipe: dono + Claude Code + Codex)

- **Nunca** faça push direto na `main`. A `main` é publicada automaticamente pela hospedagem.
- Uma tarefa = uma branch (`feat/...`, `fix/...`) = um Pull Request pequeno.
- Descreva no PR, em português simples: **o que mudou, por que, e como o dono pode testar**.
- Se a mudança exigir ação manual (variável nova, mudança de banco), escreva isso em destaque no PR.
- Quem não fez a tarefa revisa o PR (`@codex review` no GitHub, ou pedir ao Claude Code). O dono faz o merge.
- **Segredos:** nunca colocar `DATABASE_URL`, `AUTH_SECRET`, `SETUP_TOKEN` reais ou outras chaves no código
  ou em PRs. O `.env` não vai para o GitHub.
