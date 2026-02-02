const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    // Liên kết với bảng User cũ thông qua ID
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      unique: true // Mỗi user chỉ có 1 profile duy nhất
    },
    // Các thông tin mở rộng
    displayName: { type: String, trim: true },
    bio: { type: String, default: "" },
    avatar: { 
      type: String, 
      default: "https://api.dicebear.com/7.x/identicon/svg?seed=default" 
    },
    phoneNumber: { type: String, trim: true },
    address: { type: String },
    gender: { 
      type: String, 
      enum: ["Male", "Female", "Other", ""], 
      default: "" 
    },
    dob: { type: Date } // Ngày tháng năm sinh
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);