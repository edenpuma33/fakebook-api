## Step 1
### Create file server.js

```bash
npm init - y
```

### Fix package.json (script)
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