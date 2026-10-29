import { PrismaClient } from "@prisma/client";
import { SENHA_EXEMPLO, popularBanco } from "../src/lib/dados-exemplo";

const db = new PrismaClient();

popularBanco(db)
  .then((r) => {
    console.log(`Banco populado: ${r.medicos} médicos, ${r.consultas} consultas.`);
    console.log(`  admin@clinicaaberta.com.br  /  ${SENHA_EXEMPLO}   (admin)`);
    console.log(`  helena@corevida.com.br      /  ${SENHA_EXEMPLO}   (médica com agenda cheia)`);
    console.log(`  ana@exemplo.com.br          /  ${SENHA_EXEMPLO}   (paciente)`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
