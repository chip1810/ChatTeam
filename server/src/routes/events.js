const express = require("express")
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const Event = require("../models/Event")
const router = express.Router();
// POST /api/events
router.post("/", auth, async (req, res) => {
    const { title, description, invitedUserIds, isPublic, eventDate } = req.body;

    const event = await Event.create({
        title,
        description,
        admin: req.userId,
        isPublic,
        eventDate,
        invitedUsers: invitedUserIds.map(id => ({ user: id, status: "pending" }))
    });

    // Nếu muốn gửi tin nhắn tự động vào hộp thư của từng người:
    if (!isPublic && invitedUserIds.length > 0) {
        const Message = require("../models/Message"); // Import model Message
        const Conversation = require("../models/Conversation");

        for (const guestId of invitedUserIds) {
            // 1. Tìm hoặc tạo conversation 1-1
            let conv = await Conversation.findOne({
                isGroup: false,
                members: { $all: [req.userId, guestId] }
            });

            if (!conv) {
                conv = await Conversation.create({
                    members: [req.userId, guestId],
                    isGroup: false
                });
            }

            // 2. Tạo tin nhắn thông báo sự kiện
            await Message.create({
                conversationId: conv._id,
                sender: req.userId,
                text: `LỜI MỜI SỰ KIỆN: ${title}. Nhấn vào trang Diễn đàn để xem chi tiết và xác nhận tham gia!`,
            });

            // 3. (Nếu có Socket.io) Bắn event cho guestId để họ thấy tin nhắn nhảy lên
            // io.to(guestId).emit("new-message", ...);
        }
    }

    res.json(event);
});

// PATCH /api/events/:eventId/status
router.patch("/:eventId/status", auth, async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.userId;
        const eventId = req.params.eventId;

        // 1. Tìm sự kiện trước
        let event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Sự kiện không tồn tại" });

        // 2. Kiểm tra xem user đã có trong list mời chưa
        const userIndex = event.invitedUsers.findIndex(u => u.user.toString() === userId);

        if (userIndex > -1) {
            // ĐÃ CÓ: Cập nhật status tại vị trí đó
            event.invitedUsers[userIndex].status = status;
        } else {
            // CHƯA CÓ: Nếu là Public thì mới cho phép "nhảy vào" list
            if (event.isPublic) {
                event.invitedUsers.push({ user: userId, status: status });
            } else {
                return res.status(403).json({ message: "Đây là sự kiện riêng tư!" });
            }
        }

        await event.save();

        // Populate lại để trả về cho Front-end update state
        const updatedEvent = await Event.findById(eventId)
            .populate("admin", "username avatar")
            .populate("invitedUsers.user", "username avatar")
            .lean(); // Thêm lean() để biến nó thành plain object, tránh lỗi proxy của mongoose

        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
    }
});
// GET /api/events
router.get("/", auth, async (req, res) => {
    try {
        const userId = req.userId;

        // Tìm các sự kiện: 
        // 1. Công khai (isPublic: true)
        // 2. Hoặc do mình tạo (admin: userId)
        // 3. Hoặc mình được mời (invitedUsers.user: userId)
        const events = await Event.find({
            $or: [
                { isPublic: true },
                { admin: userId },
                { "invitedUsers.user": userId }
            ]
        })
            .populate("admin", "username avatar")
            .populate("invitedUsers.user", "username avatar") // Thêm dòng này để hiện list guest
            .sort({ createdAt: -1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách sự kiện" });
    }
});

module.exports = router;
