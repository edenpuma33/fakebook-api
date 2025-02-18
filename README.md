# CC19-FAKEBOOK-API

### env guide

PORT=8899  
DATABASE_URL=  
JWT_SECRET=

---
### service
|path |method |authen |params |query |body |
|:----|:-----:|:-----:|:-----:|:----:|----:|
|/auth/register|post|-|-|-| {identity, firstName, lastName, password, confirmPassword}
|/auth/login|post|-|-|-| {identity, password}
|/auth/me|get|y|-|-|-|
|/post|get|y|-|-|-|
|/post|post|y|-|-|{message, image(file)}
|/post|put|y|:id|-|{message, image(file)}
|/post|delete|y|:id|-|-
|/comment|post|y|-|-|{message, postId}
|/like|post|y|-|-|{postId}
|/like|delete|y|:id|-|-

---

## Step 1 Install module

### Create file server.js
```bash
npm init - y
```

### Edit package.json (script)

```json
"scripts": {
    "dev": "nodemon server.js",
    "start": "nodemon server.js"
  },
```

### Create .gitignore
```json
node_modules/
.env
```

### Create file .env
```bash
PORT=8899  
DATABASE_URL=  
JWT_SECRET=
```

### Install Library
```bash
npm i express dotenv nodemon cors morgan helmet
```
---

## Step 2 Edit server.js & Create Folder middleware, routes


### Create /middlewares/notFound.js
```js
module.exports = (req, res) => {
  res.status(404).json({ message: "Service is not found" });
};
```

### Create /middlewares/errorMiddleware.js
```js
module.exports = (err, req, res, next) => {
  console.log(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message });
};
```

### Create /routes/auth-route.js
```js
const express = require("express");
const authRoute = express.Router();

authRoute.post("/register", (req, res) => {
  res.send("Register");
});
authRoute.post("/login", (req, res) => {
  res.send("Login");
});
authRoute.get("/me", (req, res) => {
  res.send("Getme");
});

module.exports = authRoute;
```

### Edit server.js
```js
require("dotenv").config(); // The dotenv is a module that loads environment variables from a . env file that you create and adds them to the process.
const express = require("express");
const notFound = require("./middlewares/notFound");
const errorMiddleware = require("./middlewares/errorMiddleware");
const authRoute = require("./routes/auth-route");
const app = express();

app.use(express.json());

app.use("/auth", authRoute);
app.use("/post", (req, res) => {
  res.send("post service");
});
app.use("/comment", (req, res) => {
  res.send("comment service");
});
app.use("/like", (req, res) => {
  res.send("like service");
});

// notFound
app.use(notFound);

// errorMiddleware
app.use(errorMiddleware);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server on port: ${port}`));
```
ลองทดสอบยิง api โดยใช้ Thunder Client แทน Postman

---
## Step 3 Create Folder controllers & Edit auth-route.js
### Create controllers/auth-controllers.js
```js
module.exports.register = (req, res) => {
  res.json({ message: "Register..." });
};

module.exports.login = (req, res) => {
  res.json({ message: "Login..." });
};

module.exports.getMe = (req, res) => {
  res.json({ message: "Getme..." });
};
```

### Edit auth-route.js
```js
const express = require("express");
const { register, login, getMe } = require("../controllers/auth-controller");
const authRoute = express.Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.get("/me", getMe);

module.exports = authRoute;
```
---

## Step 4 Start prisma & Edit schema.prisma
```bash
npm i -D prisma
npx prisma init
```

### schema.prisma
```bash
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id           Int            @id @default(autoincrement())
  firstName    String
  lastName     String
  email        String?        @unique
  mobile       String?        @unique
  password     String
  profileImage String?
  coverImage   String?
  createdAt    DateTime       @default(now()) @db.Timestamp(0)
  updatedAt    DateTime       @updatedAt @db.Timestamp(0)
  posts        Post[]
  comment      Comment[]
  Like         Like[]
  senders      Relationship[] @relation(name: "sender")
  receivers    Relationship[] @relation(name: "receiver")
}

model Post {
  id        Int       @id @default(autoincrement())
  message   String?   @db.Text
  image     String?
  createdAt DateTime  @default(now()) @db.Timestamp(0)
  updatedAt DateTime? @updatedAt @db.Timestamp(0)
  userId    Int
  user      User      @relation(fields: [userId], references: [id])
  comment   Comment[]
  Like      Like[]
}

model Comment {
  id        Int       @id @default(autoincrement())
  message   String?   @db.Text
  createdAt DateTime  @default(now()) @db.Timestamp(0)
  updatedAt DateTime? @updatedAt @db.Timestamp(0)
  userId    Int
  postId    Int
  user      User      @relation(fields: [userId], references: [id])
  post      Post      @relation(fields: [postId], references: [id])
}

model Like {
  userId    Int
  postId    Int
  createdAt DateTime @default(now()) @db.Timestamp(0)
  user      User     @relation(fields: [userId], references: [id])
  post      Post     @relation(fields: [postId], references: [id])

  @@id([userId, postId])
}

enum RelationshipStatus {
  PENDING
  ACCEPTED
}

model Relationship {
  id         Int                @id @default(autoincrement())
  status     RelationshipStatus @default(PENDING)
  createdAt  DateTime           @default(now()) @db.Timestamp(0)
  updatedAt  DateTime?          @updatedAt @db.Timestamp(0)
  senderId   Int
  receiverId Int
  sender     User               @relation(name: "sender", fields: [senderId], references: [id])
  receiver   User               @relation(name: "receiver", fields: [receiverId], references: [id])
}
```

### Edit .env
```bash
PORT=8899  
DATABASE_URL="mysql://root:puma32442@localhost:3306/cc19-fakebook"
JWT_SECRET=TheSeCret
```

### ทำทุกครั้งที่มีการเปลี่ยนแปลงข้อมูลใน schema.prisma
```bash
npx prisma generate
```

### สร้าง schema.prisma ใน mysql
```bash
npx prisma db push
```
---
## Step 5 Create Fodler Utils & Edit auth-controller.js

### Install bcryptjs & jsonwebtoken
```bash
npm i bcryptjs jsonwebtoken
```

### Create utilts/createError.js
```js
module.exports = (statusCode, msg) => {
  const error = new Error(msg);
  error.statusCode = statusCode;

  throw error;
};
```

### auth-controller.js
```js
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
  res.json({ msg: "Getme..." });
};
```
---

## Step 6 Create authenticate.js & Edit auth-route.js & Edit auth-controllers
### middlewares/authenticate.js
```js
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
```

### /routes/auth-route.js
```js
const express = require("express");
const { register, login, getMe } = require("../controllers/auth-controller");
const authenticate = require("../middlewares/authenticate");
const authRoute = express.Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.get("/me", authenticate, getMe);

module.exports = authRoute;
```

edit getMe
### /controllers/auth-controllers.js
```js
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
```
---
## Step 7 Create resetDB.js & seed.js & Edit package.json
### prisma/resetDB.js
```js
require("dotenv").config();
const prisma = require("../models");

// beware order of table to delete
async function resetDatabase() {
  await prisma.$transaction([
    prisma.comment.deleteMany(),
    prisma.like.deleteMany(),
    prisma.post.deleteMany(),
    prisma.relationship.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  await prisma.$executeRawUnsafe("Alter Table user auto_increment=1");
}

console.log("Rest DB...");
resetDatabase();
```
### prisma/seed.js
```js
const prisma = require("../models");
const bcrypt = require("bcryptjs");

const hashedPassword = bcrypt.hashSync("123456", 10);

const userData = [
  {
    firstName: "Andy",
    lastName: "Codecamp",
    password: hashedPassword,
    email: "andy@ggg.mail",
    profileImage: "https://www.svgrepo.com/show/420364/avatar-male-man.svg",
  },
  {
    firstName: "Bobby",
    lastName: "Codecamp",
    password: hashedPassword,
    email: "bobby@ggg.mail",
    profileImage:
      "https://www.svgrepo.com/show/420319/actor-chaplin-comedy.svg",
  },
  {
    firstName: "Candy",
    lastName: "Codecamp",
    password: hashedPassword,
    mobile: "1111111111",
    profileImage: "https://www.svgrepo.com/show/420327/avatar-child-girl.svg",
  },
  {
    firstName: "Danny",
    lastName: "Codecamp",
    password: hashedPassword,
    mobile: "2222222222",
    profileImage:
      "https://www.svgrepo.com/show/420314/builder-helmet-worker.svg",
  },
];

console.log("DB seed...");

async function seedDB() {
  await prisma.user.createMany({ data: userData });
}

seedDB();
```

Edit scripts add restDB & prisma : seed
### package.json
```js
{
  "name": "fb-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "nodemon server.js",
    "resetDB": "node prisma/resetDB.js"
  },
  "prisma":{
    "seed": "node prisma/seed.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "@prisma/client": "^6.3.1",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "nodemon": "^3.1.9"
  },
  "devDependencies": {
    "prisma": "^6.3.1"
  }
}
```

### npm run resetDB คือ reset ข้อมูลใน Database ทั้งหมด (clear database)

### npx prisma db seed คือเอาข้อมูลเข้าไปใน database
---


### restDB อีก version
```json
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
```

### Edit server.js add cors morgan helmet
```js
require("dotenv").config(); // The dotenv is a module that loads environment variables from a . env file that you create and adds them to the process.
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const notFound = require("./middlewares/notFound");
const errorMiddleware = require("./middlewares/errorMiddleware");
const authRoute = require("./routes/auth-route");
const app = express();

// app.use(cors({
//   origin: 'http://localhost:5173'
// }))
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);
app.use("/post", (req, res) => {
  res.send("post service");
});
app.use("/comment", (req, res) => {
  res.send("comment service");
});
app.use("/like", (req, res) => {
  res.send("like service");
});

// notFound
app.use(notFound);

// errorMiddleware
app.use(errorMiddleware);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server on port: ${port}`));
```