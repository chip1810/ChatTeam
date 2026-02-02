const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Thêm cột này qua đây
    avatar: { 
      type: String, 
      default: "https://api.dicebear.com/7.x/identicon/svg?seed=default" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);