// src/models/Conversation.js
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isGroup: { type: Boolean, default: false },
  name: String // group name
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);
