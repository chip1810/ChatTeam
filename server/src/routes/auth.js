const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");

const router = express.Router();
const auth = require("../middleware/auth");

// register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "Thiếu thông tin đăng ký" });

  const userExist = await User.findOne({ username });
  if (userExist)
    return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });

  const emailExist = await User.findOne({ email });
  if (emailExist)
    return res.status(400).json({ message: "Email đã tồn tại" });

  const hashed = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    password: hashed,
  });

  await UserProfile.create({
    user: newUser._id,
    displayName: username,
    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
  });

  res.json({ message: "Đăng ký thành công" });
});

// login
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  // tìm theo email hoặc username
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user) {
    return res.status(400).json({ message: "Thông tin đăng nhập không hợp lệ" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).json({ message: "Thông tin đăng nhập không hợp lệ" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});

// API /me
router.get("/me", auth, async (req, res) => {
  try {
    // Tìm user từ database bằng userId mà middleware đã gán vào req
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
