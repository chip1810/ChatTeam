const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const UserProfile = require("../models/UserProfile");
const User = require("../models/User");
const cloudinary = require("../../config/cloudinary");

// 1. Lấy thông tin Profile của chính mình
router.get("/me", auth, async (req, res) => {
  try {
    // Tìm profile dựa trên userId từ middleware auth
    let profile = await UserProfile.findOne({ user: req.userId }).populate(
      "user",
      "username email",
    );

    // Nếu chưa có profile (cho user cũ), tạo mới một cái trống
    if (!profile) {
      profile = await UserProfile.create({
        user: req.userId,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${req.userId}`,
      });
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 2. Cập nhật Profile
router.put("/update", auth, async (req, res) => {
  try {
    const { displayName, bio, phoneNumber, address, gender, dob, avatarBase64 } = req.body;
    let avatarUrl;

    // 1. Nếu có ảnh mới, upload lên Cloudinary
    if (avatarBase64 && avatarBase64.startsWith("data:image")) {
      const uploadRes = await cloudinary.uploader.upload(avatarBase64, {
        folder: "chatteam/avatars",
        transformation: [{ width: 400, height: 400, crop: "fill" }]
      });
      avatarUrl = uploadRes.secure_url;
    }

    // 2. Cập nhật bảng User (Ảnh đại diện)
    if (avatarUrl) {
      await User.findByIdAndUpdate(req.userId, { avatar: avatarUrl });
    }

    // 3. Cập nhật bảng UserProfile (Các thông tin còn lại)
    const profile = await UserProfile.findOneAndUpdate(
      { user: req.userId },
      { 
        $set: { displayName, bio, phoneNumber, address, gender, dob, avatar: avatarUrl || undefined } 
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Cập nhật thành công", profile, avatar: avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
});

// 3. Lấy profile của người khác theo userId
router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Tìm profile
    let profile = await UserProfile.findOne({ user: userId }).populate(
      "user",
      "username email avatar",
    );

    // Nếu user có tồn tại nhưng chưa có profile → tạo tạm
    if (!profile) {
      const user = await User.findById(userId).select("username email avatar");
      if (!user) {
        return res.status(404).json({ message: "User không tồn tại" });
      }

      profile = await UserProfile.create({
        user: userId,
        avatar:
          user.avatar ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${userId}`,
      });

      profile = await profile.populate("user", "username email avatar");
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


module.exports = router;
