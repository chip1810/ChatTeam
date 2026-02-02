/* =======================
   1. IMPORT CORE LIBRARIES
======================= */
const express = require("express");
const http = require("http");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
require("dotenv").config({ path: "./config/.env" });
const cloudinary = require("./config/cloudinary");

/* =======================
   2. IMPORT MODELS & ROUTES
======================= */
const Message = require("./src/models/Message");
const Conversation = require("./src/models/Conversation");
const authRoutes = require("./src/routes/auth");
const conversationRoutes = require("./src/routes/conversations");
const profileRoutes = require("./src/routes/profile");

/* =======================
   3. INIT EXPRESS APP
======================= */
const app = express();

/* =======================
   4. EXPRESS MIDDLEWARES
======================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://0d899qvr-5173.asse.devtunnels.ms",
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* =======================
   5. HTTP API ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/profile", profileRoutes);

/* =======================
   6. CREATE HTTP SERVER
======================= */
const server = http.createServer(app);

/* =======================
   7. CONNECT TO MONGODB
======================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error("Mongo error:", err));

/* =======================
   8. INIT SOCKET.IO
======================= */
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://0d899qvr-5173.asse.devtunnels.ms",
    ],
    credentials: true,
  },
  transports: ["websocket"], // rất nên có
  maxHttpBufferSize: 1e7, // 10MB
});

/* =======================
   9. SOCKET AUTH MIDDLEWARE
======================= */
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

/* =======================
   10. SOCKET EVENTS
======================= */
io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  // 🔥 mỗi user join room riêng = userId
  socket.join(socket.userId);

  /* ======================
     JOIN CONVERSATION
  ====================== */
  socket.on("join-conversation", async (conversationId) => {
    if (socket.currentConversation) {
      socket.leave(socket.currentConversation);
    }

    socket.currentConversation = conversationId;
    socket.join(conversationId);

    const conversation = await Conversation.findById(conversationId).populate(
      "members",
      "_id username avatar",
    );

    // 🔥 GỬI INFO CHO CLIENT
    socket.emit("conversation-info", conversation);

    // 👉 mark read toàn bộ message
    await Message.updateMany(
      {
        conversationId,
        readBy: { $ne: socket.userId },
      },
      { $addToSet: { readBy: socket.userId } },
    );

    io.to(conversationId).emit("conversation-read", {
      conversationId,
      userId: socket.userId,
    });

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("sender", "username avatar")
      .populate("readBy", "username avatar");

    socket.emit("chat-history", messages);
  });

  /* ======================
     SEND MESSAGE
  ====================== */
  socket.on("send-message", async (data) => {
    try {
      let imageUrls = [];

      if (data.images && Array.isArray(data.images)) {
        for (const img of data.images) {
          if (typeof img === "string" && !img.startsWith("data:image")) {
            imageUrls.push(img);
          } else if (img.startsWith("data:image")) {
            const result = await cloudinary.uploader.upload(img, {
              folder: "chat/messages",
            });
            imageUrls.push(result.secure_url);
          }
        }
      }

      if (!data.text && imageUrls.length === 0) return;

      const msg = await Message.create({
        conversationId: data.conversationId,
        sender: socket.userId,
        text: data.text || "",
        images: imageUrls,
        readBy: [socket.userId],
      });

      // 🔥 CHECK AI ĐANG TRONG ROOM
      const socketsInRoom = await io.in(data.conversationId).fetchSockets();

      for (const s of socketsInRoom) {
        if (s.userId !== socket.userId) {
          await Message.updateOne(
            { _id: msg._id },
            { $addToSet: { readBy: s.userId } },
          );
        }
      }

      const finalMsg = await Message.findById(msg._id)
        .populate("sender", "username avatar")
        .populate("readBy", "username avatar");

      // 4️⃣ emit message CHUẨN
      io.to(data.conversationId).emit("receive-message", finalMsg);

      // 🔥 UPDATE SIDEBAR CHO TỪNG USER
      const conv = await Conversation.findById(data.conversationId);

      for (const memberId of conv.members) {
        const isRead = socketsInRoom.some(
          (s) => s.userId === memberId.toString(),
        );

        io.to(memberId.toString()).emit("conversation-updated", {
          conversationId: data.conversationId,
          lastMessage: msg,
          isRead,
        });
      }
    } catch (err) {
      console.error(err);
    }
  });

  /* ======================
     MARK READ (CHỈ 1 LẦN)
  ====================== */
  socket.on("mark-read", async ({ conversationId }) => {
    await Message.updateMany(
      {
        conversationId,
        readBy: { $ne: socket.userId },
      },
      { $addToSet: { readBy: socket.userId } },
    );

    io.to(conversationId).emit("conversation-read", {
      conversationId,
      userId: socket.userId,
    });
  });
});

/* =======================
   11. START SERVER
======================= */
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
