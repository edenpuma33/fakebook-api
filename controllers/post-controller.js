const path = require("path");
const fs = require("fs/promises");
const tryCatch = require("../utils/tryCatch");
const cloudinary = require("../config/cloudinary");
const prisma = require("../models");
const createError = require("../utils/createError");

module.exports.createPost = tryCatch(async (req, res) => {
  const { message } = req.body;
  const haveFile = !!req.file;
  let uploadResult = {};
  if (haveFile) {
    uploadResult = await cloudinary.uploader.upload(req.file.path, {
      overwrite: true,
      public_id: path.parse(req.file.path).name,
    });
    fs.unlink(req.file.path);
  }
  //   console.log(uploadResult);
  const data = {
    message: message,
    image: uploadResult.secure_url || "",
    userId: req.user.id,
  };
  const rs = await prisma.post.create({ data: data });
  res.status(201).json({ msg: "create post done", result: rs });
});

module.exports.getAllPosts = tryCatch(async (req, res) => {
  // ชื่อต้องเหมือนในตาราง prisma
  const rs = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
      comment: {
        // select: {
        //   message: true,
        // },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      },
      Like: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });
  res.json({ posts: rs });
});

module.exports.updatePost = async (req, res) => {
  res.json({ msg: "Update Post" });
};

module.exports.deletePost = tryCatch(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    createError(400, "require id parameter");
  }
  const postData = await prisma.post.findUnique({
    where: {
      id: +id,
    },
  });
  console.log(postData);
  if (req.user.id !== postData.userId) {
    createError(400, "You don't have this permission");
  }
  const rs = await prisma.post.delete({
    where: { id: +id },
  });
  res.json({ msg: `Delete post id=${id} done`, deletedPost: postData });
});
