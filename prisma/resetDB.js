require("dotenv").config();
const prisma = require("../models");

// beware order of table to delete
async function resetDatabase() {
  const tableNames = Object.keys(prisma).filter(
    (key) => !key.startsWith("$") && !key.startsWith("_")
  );
  console.log(tableNames);

  for (let table of tableNames) {
    console.log(`Rest DB & Auto_increament : ${table}`);
    await prisma[table].deleteMany();
    await prisma.$executeRawUnsafe(
      `Alter Table \`${table}\` auto_increment = 1`
    );
  }
}

resetDatabase();

// npm run resetDB
