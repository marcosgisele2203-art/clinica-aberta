# Clínica Aberta

Sistema onde o médico cadastra a clínica, publica a agenda e recebe agendamentos online.
Três perfis: **paciente**, **médico** e **admin**.

Stack: Next.js 15 (App Router) · TypeScript · Prisma · SQLite · sessão por cookie assinado (jose + bcrypt).
Sem Tailwind e sem serviço externo: o CSS é próprio e o banco é um arquivo dentro do projeto.

## Rodando na sua máquina

Precisa de **Node 20 ou mais novo**.

```bash
npm install
cp .env.example .env     # no Windows: copy .env.example .env
npm run setup            # cria o banco e popula com dados de exemplo
npm run dev
```

Abra <http://localhost:3000>.

### Contas criadas pelo seed

| E-mail                       | Senha    | Perfil                       |
| ---------------------------- | -------- | ---------------------------- |
| admin@clinicaaberta.com.br   | senha123 | Admin (fila de aprovação)    |
| helena@corevida.com.br       | senha123 | Médica com agenda preenchida |
| ana@exemplo.com.br           | senha123 | Paciente                     |

Os outros médicos do seed usam a mesma senha. Dois deles (Yara e Elias) começam **em análise**,
para você exercitar a aprovação no painel admin.

## O que já funciona

- **Paciente** — busca por nome, especialidade, cidade e convênio; página pública da clínica com
  endereço, valor e convênios; agendamento escolhendo dia e horário. Não precisa de conta para
  marcar; horário já ocupado ou vencido não aparece disponível.
- **Médico** — cria conta, preenche o cadastro em 4 passos (CRM, clínica, agenda, plano) e envia
  para análise. Depois de aprovado, vê a agenda do dia, as próximas consultas e pode cancelar.
  Enquanto não é aprovado, a página pública fica fora do ar.
- **Admin** — fila de análise com aprovar/recusar, lista de clínicas com suspender/reativar e os
  números: cadastros pendentes, clínicas no ar, agendamentos e receita mensal somada pelos planos.

Regras garantidas no servidor, não só na tela: índice único em `(medicoId, data, hora)` impede
duas pessoas marcarem o mesmo horário; o horário enviado é conferido contra a agenda real do
médico; cada ação verifica o papel de quem está logado.

## Estrutura

```
prisma/schema.prisma      User, Medico, Consulta
prisma/seed.ts            dados de exemplo
src/lib/db.ts             cliente Prisma
src/lib/session.ts        cookie de sessão, usuarioAtual, exigirPapel
src/lib/domain.ts         especialidades, convênios, geração de horários, formatação
src/lib/auth-actions.ts   entrar e criar conta
src/app/                  páginas e server actions por rota
```

## Trocando o SQLite por Postgres

1. Em `prisma/schema.prisma`, mude `provider = "sqlite"` para `"postgresql"`.
2. Ponha a string de conexão em `DATABASE_URL` no `.env`.
3. `npx prisma db push && npm run db:seed`.

Nada no código da aplicação muda.

## Antes de colocar no ar de verdade

- Gerar um `AUTH_SECRET` aleatório (o comando está no `.env.example`).
- Verificação de CRM de verdade (hoje o campo é só conferido pelo admin a olho).
- Confirmação por e-mail ou WhatsApp do agendamento.
- Cobrança dos planos (Pix, Stripe ou similar) — hoje o plano é só um campo no cadastro.
- Política de privacidade e consentimento: dados de saúde são dados sensíveis na LGPD.
