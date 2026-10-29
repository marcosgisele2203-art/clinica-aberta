# Clínica Aberta

Sistema onde o médico cadastra a clínica, publica a agenda e recebe agendamentos online.
Três perfis: **paciente**, **médico** e **admin**.

Stack: Next.js 15 (App Router) · TypeScript · Prisma · Postgres · sessão por cookie assinado
(jose + bcrypt). Sem Tailwind: o CSS é próprio.

## Subir online sem instalar nada (GitHub → Vercel → Neon)

Tudo pelo navegador, sem terminal.

**1. Banco no Neon** — crie uma conta grátis em neon.tech, crie um projeto e copie a
*connection string* **direct** (a que **não** tem `-pooler` no endereço).

**2. Código no GitHub** — crie um repositório novo e suba os arquivos deste projeto
(no GitHub: *Add file* → *Upload files* → arraste o conteúdo da pasta).

**3. Deploy na Vercel** — entre com o GitHub, *Add New…* → *Project*, escolha o repositório e
antes de clicar em Deploy abra *Environment Variables* e cadastre três:

| Nome          | Valor                                                       |
| ------------- | ----------------------------------------------------------- |
| `DATABASE_URL`| a connection string do Neon                                  |
| `AUTH_SECRET` | qualquer sequência longa e aleatória (uns 40 caracteres)     |
| `SETUP_TOKEN` | uma senha que só você sabe, usada uma vez na instalação      |

**4. Instalar o banco** — com o deploy pronto, abra `https://seu-projeto.vercel.app/configurar`,
digite o `SETUP_TOKEN` e confirme. A tela cria as tabelas e carrega os dados de exemplo.

**5. Fechar a porta** — depois que o sistema estiver com dados reais, apague a pasta
`src/app/configurar` do repositório. A Vercel refaz o deploy sozinha.

### Contas criadas na instalação

| E-mail                       | Senha    | Perfil                       |
| ---------------------------- | -------- | ---------------------------- |
| admin@clinicaaberta.com.br   | senha123 | Admin (fila de aprovação)    |
| helena@corevida.com.br       | senha123 | Médica com agenda preenchida |
| ana@exemplo.com.br           | senha123 | Paciente                     |

Os outros médicos usam a mesma senha. Dois deles (Yara e Elias) começam **em análise**, para
você exercitar a aprovação no painel admin. **Troque essas senhas antes de usar pra valer.**

## Rodando na sua máquina (precisa de Node 20+)

```bash
npm install
cp .env.example .env     # no Windows (PowerShell): copy .env.example .env
npx prisma db push       # cria as tabelas no banco do DATABASE_URL
npm run db:seed          # dados de exemplo
npm run dev
```

Abra <http://localhost:3000>.

Para usar SQLite local em vez de Postgres: em `prisma/schema.prisma` troque
`provider = "postgresql"` por `"sqlite"`, use `DATABASE_URL="file:./dev.db"` e remova os
`mode: "insensitive"` de `src/app/buscar/page.tsx` (o SQLite não aceita essa opção).

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
prisma/seed.ts            carrega os dados de exemplo pelo terminal
src/lib/db.ts             cliente Prisma
src/lib/session.ts        cookie de sessão, usuarioAtual, exigirPapel
src/lib/domain.ts         especialidades, convênios, geração de horários, formatação
src/lib/dados-exemplo.ts  os médicos e consultas de demonstração
src/lib/schema-sql.ts     DDL usada pela tela /configurar
src/lib/auth-actions.ts   entrar e criar conta
src/app/                  páginas e server actions por rota
```

Ao mudar `prisma/schema.prisma`, atualize `src/lib/schema-sql.ts` junto — é a cópia em SQL puro
que a tela de instalação executa.

## Antes de usar pra valer

- Trocar as senhas das contas de exemplo e apagar `src/app/configurar`.
- Verificação de CRM de verdade (hoje o admin confere a olho).
- Confirmação por e-mail ou WhatsApp do agendamento.
- Cobrança dos planos (Pix, Stripe ou similar) — hoje o plano é só um campo no cadastro.
- Política de privacidade e consentimento: dados de saúde são dados sensíveis na LGPD.
