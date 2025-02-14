const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../models"); // ถ้ามีไฟล์ index.js อย่างเดียวสามารถละได้

const createError = require("../utils/createError");
const tryCatch = require("../utils/tryCatch");

function checkEmailorMobile(identity) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^[0-9]{10,15}$/;
  let identityKey = "";
  if (emailRegex.test(identity)) {
    identityKey = "email";
  }
  if (mobileRegex.test(identity)) {
    identityKey = "mobile";
  }
  if (!identityKey) {
    createError(400, "Only email or mobile number can be register");
  }

  return identityKey;
}

module.exports.register = tryCatch(async (req, res, next) => {
  const { identity, firstName, lastName, password, confirmPassword } = req.body;
  // validation
  if (
    !(
      identity.trim() &&
      firstName.trim() &&
      lastName.trim() &&
      password.trim() &&
      confirmPassword.trim()
    )
  ) {
    createError(400, "Please fill all data");
  }

  if (password !== confirmPassword) {
    createError(400, "please check confirm-password ");
  }

  // identity เป็น email หรือ mobile phone number
  const identityKey = checkEmailorMobile(identity);

  // หาว่ามี user นี้แล้วหรือยัง
  const findIdentity = await prisma.user.findUnique({
    where: { [identityKey]: identity },
  });
  if (findIdentity) {
    createError(409, `Already have this user : ${identity}`);
  }

  // เตรียมข้อมูล new user + hash password
  const newUser = {
    [identityKey]: identity,
    password: await bcrypt.hash(password, 10),
    firstName: firstName,
    lastName: lastName,
  };
  // สร้าง new user ใน database
  const result = await prisma.user.create({ data: newUser });
  console.log(result);
  res.json({ msg: `Register successful`, result });
});

module.exports.login = tryCatch(async (req, res, next) => {
  const { identity, password } = req.body;
  // validation
  if (!identity.trim() || !password.trim()) {
    createError(400, "Please fill all data");
  }

  // identity เป็น email หรือ mobile phone
  const identityKey = checkEmailorMobile(identity);

  // find user
  const foundUser = await prisma.user.findUnique({
    where: { [identityKey]: identity },
  });

  if (!foundUser) {
    createError(401, "Invalid Login");
  }

  // check password
  let pwOk = await bcrypt.compare(password, foundUser.password);
  if (!pwOk) {
    createError(401, "Invalid Login");
  }

  // create jwt token
  const payload = { id: foundUser.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15d" });

  // delete foundUser.password
  // delete foundUser.createdAt
  // delete foundUser.updatedAt

  const { password: pw, createAt, updatedAt, ...userData } = foundUser;

  res.json({ msg: "Login Successful", token: token, user: userData });
});

module.exports.getMe = (req, res) => {
  res.json({ user: req.user });
};
