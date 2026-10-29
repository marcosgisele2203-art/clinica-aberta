import { PrismaClient } from "@prisma/client";
import { SENHA_EXEMPLO, popularBanco } from "../src/lib/dados-exemplo";

const db = new PrismaClient();

popularBanco(db)
  .then((r) => {
    console.log(
      `Banco populado: ${r.unidades} unidades, ${r.cidadaos} moradores, ${r.agendamentos} agendamentos.`
    );
    console.log(`  111.444.777-35  /  ${SENHA_EXEMPLO}   (secretaria)`);
    console.log(`  529.982.247-25  /  ${SENHA_EXEMPLO}   (morador)`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
