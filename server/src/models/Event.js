const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPublic: { type: Boolean, default: true },
  // Danh sách những người được chọn
  invitedUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { 
      type: String, 
      enum: ["pending", "viewed", "joined", "declined"], 
      default: "pending" 
    }
  }],
  eventDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);