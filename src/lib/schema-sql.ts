/**
 * DDL equivalente a prisma/schema.prisma, em Postgres.
 *
 * Serve só para a tela /configurar criar as tabelas direto do navegador, no deploy,
 * sem precisar rodar `prisma db push` num terminal. Quem roda o projeto localmente
 * continua usando o Prisma normalmente.
 *
 * Ao mudar o schema.prisma, mude estas instruções junto.
 */
export const SQL_CRIAR_TABELAS: string[] = [
  `CREATE TABLE IF NOT EXISTS "User" (
     "id" TEXT PRIMARY KEY,
     "nome" TEXT NOT NULL,
     "email" TEXT NOT NULL,
     "senhaHash" TEXT NOT NULL,
     "telefone" TEXT,
     "role" TEXT NOT NULL DEFAULT 'PACIENTE',
     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   )`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" ("email")`,

  `CREATE TABLE IF NOT EXISTS "Medico" (
     "id" TEXT PRIMARY KEY,
     "userId" TEXT NOT NULL,
     "crm" TEXT NOT NULL,
     "crmUf" TEXT NOT NULL,
     "especialidade" TEXT NOT NULL,
     "bio" TEXT NOT NULL DEFAULT '',
     "clinica" TEXT NOT NULL,
     "slug" TEXT NOT NULL,
     "cep" TEXT NOT NULL,
     "endereco" TEXT NOT NULL,
     "bairro" TEXT NOT NULL,
     "cidade" TEXT NOT NULL,
     "uf" TEXT NOT NULL,
     "diasSemana" TEXT NOT NULL DEFAULT '1,2,3,4,5',
     "horaInicio" INTEGER NOT NULL DEFAULT 8,
     "horaFim" INTEGER NOT NULL DEFAULT 18,
     "duracaoMin" INTEGER NOT NULL DEFAULT 30,
     "valorCentavos" INTEGER NOT NULL DEFAULT 30000,
     "convenios" TEXT NOT NULL DEFAULT 'Particular',
     "plano" TEXT NOT NULL DEFAULT 'Profissional',
     "status" TEXT NOT NULL DEFAULT 'PENDENTE',
     "motivoRecusa" TEXT,
     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "publicadoEm" TIMESTAMP(3),
     CONSTRAINT "Medico_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
   )`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "Medico_userId_key" ON "Medico" ("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Medico_slug_key" ON "Medico" ("slug")`,
  `CREATE INDEX IF NOT EXISTS "Medico_status_especialidade_idx" ON "Medico" ("status", "especialidade")`,
  `CREATE INDEX IF NOT EXISTS "Medico_cidade_idx" ON "Medico" ("cidade")`,

  `CREATE TABLE IF NOT EXISTS "Consulta" (
     "id" TEXT PRIMARY KEY,
     "medicoId" TEXT NOT NULL,
     "pacienteId" TEXT,
     "nome" TEXT NOT NULL,
     "telefone" TEXT NOT NULL,
     "convenio" TEXT NOT NULL,
     "motivo" TEXT NOT NULL DEFAULT '',
     "data" TEXT NOT NULL,
     "hora" TEXT NOT NULL,
     "status" TEXT NOT NULL DEFAULT 'CONFIRMADA',
     "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "Consulta_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
     CONSTRAINT "Consulta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
   )`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "Consulta_medicoId_data_hora_key" ON "Consulta" ("medicoId", "data", "hora")`,
  `CREATE INDEX IF NOT EXISTS "Consulta_medicoId_data_idx" ON "Consulta" ("medicoId", "data")`,
];
