const path = require("path");
const multer = require("multer"); // ใช้เพื่ออัพโหลดไฟล์

console.log(__dirname);
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../upload-pic")),
  filename: (req, file, cb) => {
    console.log(file.originalname);
    console.log(path.extname(file.originalname));
    let fileExt = path.extname(file.originalname);
    cb(null, `pic_${Date.now()}_${Math.round(Math.random() * 100)}${fileExt}`);
  },
});

module.exports = multer({ storage: storage });
