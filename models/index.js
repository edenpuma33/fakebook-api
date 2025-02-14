// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();


// module.exports = prisma;

module.exports = new (require("@prisma/client")).PrismaClient
