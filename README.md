# Agenda Saúde

Agendamento de consultas nas unidades básicas de saúde de um município. O morador marca pelo
site; a secretaria de saúde cadastra as unidades, define quantas vagas cada uma abre e registra
quem compareceu.

Stack: Next.js 15 (App Router) · TypeScript · Prisma · Postgres · sessão por cookie assinado
(jose + bcrypt). Sem Tailwind: o CSS é próprio.

## Como funciona

**Morador** — faz um cadastro único com nome, CPF, data de nascimento e, se souber, cartão SUS.
Depois escolhe a unidade, a especialidade e vê os próximos 21 dias com as vagas que restam em cada
turno. Confirma e recebe um protocolo para apresentar na recepção. Pode cancelar pelo site, e a
vaga volta para a fila.

**Secretaria** — cadastra as unidades, abre vagas por especialidade, dia da semana e turno
("Clínico Geral, segunda a sexta, manhã, 18 vagas"), fecha dias de feriado ou dedetização, e na
agenda do dia marca quem veio e quem faltou. O painel mostra a procura por unidade e a taxa de
falta.

### Regras que ficam no servidor, não só na tela

- A vaga é conferida dentro de uma transação isolada: se duas pessoas pegarem a última vaga ao
  mesmo tempo, só uma confirma e a outra recebe aviso para escolher outro dia.
- O dia e o turno enviados são conferidos contra as vagas reais da unidade — não adianta forjar
  uma data em que o posto não atende.
- Um morador não acumula dois agendamentos futuros da mesma especialidade.
- Nada é marcado para o mesmo dia: a agenda começa amanhã.
- As datas usam o fuso do município (`America/Campo_Grande`), não o relógio do servidor. Sem isso,
  depois das 21h o sistema entenderia que já é o dia seguinte.

## Subir online sem instalar nada

Tudo pelo navegador, sem terminal.

**1. Banco Postgres** — crie um no seu servidor (Easypanel, Dokploy, Coolify) ou num serviço como
Neon, e guarde a connection string.

**2. Código no GitHub** — este repositório.

**3. Deploy** — aponte a hospedagem para o repositório, build com Nixpacks (ou `npm run build` e
`npm start`), porta **3000**, e cadastre três variáveis de ambiente:

| Nome           | Valor                                                   |
| -------------- | ------------------------------------------------------- |
| `DATABASE_URL` | a connection string do Postgres                          |
| `AUTH_SECRET`  | sequência longa e aleatória (uns 40 caracteres)          |
| `SETUP_TOKEN`  | uma senha que só você sabe, usada uma vez na instalação  |

Opcional: `NEXT_PUBLIC_FUSO` para outro fuso (`America/Sao_Paulo`, por exemplo).

**4. Instalar o banco** — abra `https://seu-endereco/configurar`, digite o `SETUP_TOKEN` e
confirme. A tela cria as tabelas e carrega unidades de exemplo.

**5. Fechar a porta** — com dados reais no ar, apague a pasta `src/app/configurar` e o bloco de
acesso de demonstração em `src/app/entrar/page.tsx`.

### Acessos criados na instalação

| CPF             | Senha    | Perfil     |
| --------------- | -------- | ---------- |
| 111.444.777-35  | senha123 | Secretaria |
| 529.982.247-25  | senha123 | Morador    |

São CPFs de teste, válidos apenas nos dígitos verificadores. **Troque as senhas antes de usar com
a população.**

## Rodando na sua máquina (Node 20+)

```bash
npm install
cp .env.example .env     # no Windows (PowerShell): copy .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

## Estrutura

```
prisma/schema.prisma      Usuario, Unidade, Disponibilidade, Bloqueio, Agendamento
src/lib/domain.ts         especialidades, turnos, datas no fuso certo, validação de CPF
src/lib/schema-sql.ts     a mesma estrutura em SQL puro, usada pela tela /configurar
src/lib/dados-exemplo.ts  unidades e moradores de demonstração
src/lib/session.ts        cookie de sessão, usuarioAtual, exigirPapel
src/app/unidades          busca de unidades
src/app/unidade/[slug]    página da unidade e agendamento
src/app/meus-agendamentos painel do morador
src/app/secretaria        unidades, vagas, bloqueios e agenda do dia
```

Ao mudar `prisma/schema.prisma`, atualize `src/lib/schema-sql.ts` junto.

## Antes de usar com a população

- **Respaldo da secretaria de saúde.** Se o posto continuar marcando no caderno em paralelo, duas
  pessoas caem no mesmo turno. A agenda do sistema precisa ser a agenda oficial.
- **LGPD.** Aqui há dado de saúde ligado a CPF, que é dado pessoal sensível. É preciso base legal,
  aviso de privacidade e definição de quem acessa o quê, formalizados pela prefeitura.
- **Confirmação e lembrete por WhatsApp.** Hoje o morador marca e não recebe nada. É o maior
  buraco, e o que mais reduz falta.
- **Senha esquecida.** Não existe recuperação; hoje só a secretaria resolveria no banco.
- **Acesso por unidade.** Hoje só a secretaria entra. Dar login próprio para a recepção de cada
  posto é o passo seguinte natural.
- **Fila de espera** quando as vagas acabam, e **bloqueio de quem falta** seguidas vezes.
