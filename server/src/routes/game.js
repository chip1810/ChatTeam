const express = require("express")
const auth = require("../middleware/auth");
const router = express.Router();

// POST /api/game/invite
router.post("/invite", auth, async (req, res) => {
  const { friendId, roomId } = req.body;
  const inviteLink = `http://localhost:5173/game/${roomId}`;
  
  // 1. Tìm hoặc tạo conversation giữa mình và friend (giống logic Event)
  // 2. Tạo tin nhắn: "🎮 Mời bạn tham gia sòng bài Fuwa! Link: [inviteLink]"
  // 3. Bắn Socket.io để bạn mình thấy tin nhắn nhảy lên ngay lập tức
  
  res.json({ success: true });
});