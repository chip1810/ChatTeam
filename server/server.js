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

/* =======================
   2. IMPORT MODELS & ROUTES
======================= */
const Message = require("./src/models/Message");
const authRoutes = require("./src/routes/auth");
const conversationRoutes = require("./src/routes/conversations");

/* =======================
   3. INIT EXPRESS APP
======================= */
const app = express();

/* =======================
   4. EXPRESS MIDDLEWARES
======================= */
app.use(cors({
  origin: [
   "http://localhost:5173",
   "https://0d899qvr-5173.asse.devtunnels.ms"
  ],
  credentials: true
}));
app.use(express.json());

/* =======================
   5. HTTP API ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);

/* =======================
   6. CREATE HTTP SERVER
======================= */
const server = http.createServer(app);

/* =======================
   7. CONNECT TO MONGODB
======================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch(err => console.error("Mongo error:", err));

/* =======================
   8. INIT SOCKET.IO
======================= */
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://0d899qvr-5173.asse.devtunnels.ms"
    ],
    credentials: true
  },
  transports: ["websocket"] // rất nên có
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
io.on("connection", socket => {
  console.log("User connected:", socket.userId);

  // join conversation
  socket.on("join-conversation", async conversationId => {
    socket.join(conversationId);

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("sender", "username");

    socket.emit("chat-history", messages);
  });

  // send message
  socket.on("send-message", async data => {
    if (!data.text) return;

    const msg = await Message.create({
      conversationId: data.conversationId,
      sender: socket.userId,
      text: data.text
    });

    const populatedMsg = await msg.populate("sender", "username");

    io.to(data.conversationId).emit("receive-message", populatedMsg);
  });
});

/* =======================
   11. START SERVER
======================= */
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
