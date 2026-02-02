const express = require("express");
const Conversation = require("../models/Conversation");
const User = require("../models/User"); // 🔹 phải import User
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

const router = express.Router();

// GET conversations của user (có phân trang + lastMessage)
router.get("/", auth, async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;

  const conversations = await Conversation.aggregate([
    // 1. Chỉ lấy conversation có user hiện tại
    {
      $match: {
        members: new mongoose.Types.ObjectId(req.userId),
      },
    },

    // 2. Join last message
    {
      $lookup: {
        from: "messages",
        let: { convId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$conversationId", "$$convId"] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
        ],
        as: "lastMessage",
      },
    },

    // 3. lastMessage là object thay vì array
    {
      $unwind: {
        path: "$lastMessage",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 4. Sort theo last message
    {
      $sort: {
        "lastMessage.createdAt": -1,
        updatedAt: -1,
      },
    },

    // 5. Phân trang
    { $skip: page * limit },
    { $limit: limit },
  ]);

  // 6. Populate members + sender của lastMessage
  await Conversation.populate(conversations, [
    { path: "members", select: "username avatar" },
    { path: "lastMessage.sender", select: "username avatar" },
  ]);

  // 7. Xử lý isRead cho user hiện tại
  const userObjectId = new mongoose.Types.ObjectId(req.userId);

  const result = conversations.map((conv) => {
    const isRead =
      !conv.lastMessage ||
      conv.lastMessage.readBy?.some(
        (u) => u.toString() === userObjectId.toString(),
      );

    return {
      ...conv,
      isRead,
    };
  });

  res.json(result);
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
      members: { $all: [req.userId, ...memberIds] },
    });
    if (exist) return res.json(exist);
  }

  const conv = await Conversation.create({
    members: [req.userId, ...memberIds],
    isGroup,
    name,
  });

  res.json(conv);
});

// GET users có phân trang
router.get("/users", auth, async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;

  const users = await User.find(
    { _id: { $ne: req.userId } },
    "_id username email avatar",
  )
    .skip(page * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json(users);
});

module.exports = router;
