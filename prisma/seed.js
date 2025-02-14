const prisma = require("../models");
const bcrypt = require("bcryptjs");

const hashedPassword = bcrypt.hashSync("123456", 10);

const userData = [
  {
    firstName: "Andy",
    lastName: "Codecamp",
    email: "andy@gmail.com",
    password: hashedPassword,
  },
  {
    firstName: "Boby",
    lastName: "Codecamp",
    email: "bobby@gmail.com",
    password: hashedPassword,
  },
  {
    firstName: "Candy",
    lastName: "Codecamp",
    mobile: "1111111111",
    password: hashedPassword,
  },
  {
    firstName: "Danny",
    lastName: "Codecamp",
    mobile: "2222222222",
    password: hashedPassword,
  },
];

console.log("DB seed...");

async function seedDB() {
  await prisma.user.createMany({ data: userData });
}

seedDB()
