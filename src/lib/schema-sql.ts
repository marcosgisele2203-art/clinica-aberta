/**
 * DDL equivalente a prisma/schema.prisma, em Postgres.
 *
 * Serve para a tela /configurar criar as tabelas direto do navegador, no primeiro deploy,
 * sem precisar rodar `prisma db push` num terminal. Quem roda o projeto localmente
 * continua usando o Prisma normalmente.
 *
 * Ao mudar o schema.prisma, mude estas instruções junto.
 */
export const SQL_CRIAR_TABELAS: string[] = [
  `CREATE TABLE IF NOT EXISTS "Usuario" (
     "id" TEXT PRIMARY KEY,
     "nome" TEXT NOT NULL,
     "cpf" TEXT NOT NULL,
     "cns" TEXT,
     "nascimento" TEXT NOT NULL,
     "telefone" TEXT,
     "senhaHash" TEXT NOT NULL,
     "role" TEXT NOT NULL DEFAULT 'CIDADAO',
     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Usuario_cpf_key" ON "Usuario" ("cpf")`,

  `CREATE TABLE IF NOT EXISTS "Unidade" (
     "id" TEXT PRIMARY KEY,
     "nome" TEXT NOT NULL,
     "slug" TEXT NOT NULL,
     "tipo" TEXT NOT NULL DEFAULT 'UBS',
     "endereco" TEXT NOT NULL,
     "bairro" TEXT NOT NULL,
     "cidade" TEXT NOT NULL,
     "uf" TEXT NOT NULL,
     "telefone" TEXT,
     "funcionamento" TEXT NOT NULL DEFAULT 'Segunda a sexta, das 7h às 17h',
     "observacao" TEXT NOT NULL DEFAULT '',
     "ativa" BOOLEAN NOT NULL DEFAULT true,
     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Unidade_slug_key" ON "Unidade" ("slug")`,
  `CREATE INDEX IF NOT EXISTS "Unidade_cidade_ativa_idx" ON "Unidade" ("cidade", "ativa")`,

  `CREATE TABLE IF NOT EXISTS "Disponibilidade" (
     "id" TEXT PRIMARY KEY,
     "unidadeId" TEXT NOT NULL,
     "especialidade" TEXT NOT NULL,
     "diaSemana" INTEGER NOT NULL,
     "turno" TEXT NOT NULL,
     "vagas" INTEGER NOT NULL DEFAULT 10,
     "ativa" BOOLEAN NOT NULL DEFAULT true,
     CONSTRAINT "Disponibilidade_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Disponibilidade_unidadeId_especialidade_diaSemana_turno_key" ON "Disponibilidade" ("unidadeId", "especialidade", "diaSemana", "turno")`,
  `CREATE INDEX IF NOT EXISTS "Disponibilidade_unidadeId_especialidade_idx" ON "Disponibilidade" ("unidadeId", "especialidade")`,

  `CREATE TABLE IF NOT EXISTS "Bloqueio" (
     "id" TEXT PRIMARY KEY,
     "unidadeId" TEXT NOT NULL,
     "data" TEXT NOT NULL,
     "motivo" TEXT NOT NULL,
     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "Bloqueio_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Bloqueio_unidadeId_data_key" ON "Bloqueio" ("unidadeId", "data")`,

  `CREATE TABLE IF NOT EXISTS "Agendamento" (
     "id" TEXT PRIMARY KEY,
     "protocolo" TEXT NOT NULL,
     "unidadeId" TEXT NOT NULL,
     "cidadaoId" TEXT NOT NULL,
     "especialidade" TEXT NOT NULL,
     "data" TEXT NOT NULL,
     "turno" TEXT NOT NULL,
     "status" TEXT NOT NULL DEFAULT 'CONFIRMADO',
     "observacao" TEXT NOT NULL DEFAULT '',
     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "Agendamento_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
     CONSTRAINT "Agendamento_cidadaoId_fkey" FOREIGN KEY ("cidadaoId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Agendamento_protocolo_key" ON "Agendamento" ("protocolo")`,
  `CREATE INDEX IF NOT EXISTS "Agendamento_unidade_data_esp_turno_status_idx" ON "Agendamento" ("unidadeId", "data", "especialidade", "turno", "status")`,
  `CREATE INDEX IF NOT EXISTS "Agendamento_cidadaoId_data_idx" ON "Agendamento" ("cidadaoId", "data")`,
  `CREATE INDEX IF NOT EXISTS "Agendamento_data_status_idx" ON "Agendamento" ("data", "status")`,
];
