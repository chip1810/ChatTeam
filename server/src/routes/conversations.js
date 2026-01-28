const express = require("express");
const Conversation = require("../models/Conversation");
const User = require("../models/User"); // 🔹 phải import User
const auth = require("../middleware/auth");

const router = express.Router();

// GET conversations của user
router.get("/", auth, async (req, res) => {
  const convs = await Conversation.find({
    members: req.userId
  }).populate("members", "username");

  res.json(convs);
});

// CREATE conversation
router.post("/", auth, async (req, res) => {
  const { memberIds, isGroup = false, name } = req.body;

  if (!memberIds || memberIds.length === 0)
    return res.status(400).json({ message: "Missing members" });

  // 1–1 → không tạo trùng
  if (!isGroup) {
    const exist = await Conversation.findOne({
      isGroup: false,
      members: { $all: [req.userId, ...memberIds] }
    });
    if (exist) return res.json(exist);
  }

  const conv = await Conversation.create({
    members: [req.userId, ...memberIds],
    isGroup,
    name
  });

  res.json(conv);
});

// GET tất cả user (trừ chính mình)
router.get("/users", auth, async (req, res) => {
  const users = await User.find(
    { _id: { $ne: req.userId } },
    "_id username email"
  );
  res.json(users);
});

module.exports = router;
