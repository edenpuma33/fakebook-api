const jwt = require("jsonwebtoken");
const prisma = require("../models");
const createError = require("../utils/createError");
const tryCatch = require("../utils/tryCatch");

module.exports = tryCatch(async (req, res, next) => {
  const authorization = req.headers.authorization;
  //   check headers ของ http request ต้องมี authorization
  if (!authorization || !authorization.startsWith("Bearer ")) {
    createError(401, "Unauthorized 1");
  }
  const token = authorization.split(" ")[1];
  console.log(token);
  if (!token) {
    createError(401, "Unauthorized 2");
  }
  //   verify token
  const payload = jwt.verify(token, process.env.JWT_SECRET);

  //   เอา payload.id ไปหา user
  const foundUser = await prisma.user.findUnique({
    where: { id: payload.id },
  });

  if (!foundUser) {
    createError(401, "Unauthorized 3");
  }
  //   สร้าง userData ที่ไม่มี key : password, createdAt , updatedAt
  const { password, createdAt, updatedAt, ...userData } = foundUser;
  console.log(userData);

  //   ฝากข้อมูล user ไว้ที่ req object : key ชื่อ req.user
  req.user = userData;
  next();
});
