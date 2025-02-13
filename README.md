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
npm i express dotenv
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
  res.status(500).json({ message: err.message });
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
const app = express();

app.use("/auth", (req, res) => {
  res.send("auth service");
});
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