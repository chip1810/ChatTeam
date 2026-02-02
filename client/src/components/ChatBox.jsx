import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
// Thêm Image, Badge, CloseCircleFilled để làm preview
import {
  Input,
  Button,
  Layout,
  Avatar,
  Typography,
  Image,
  Badge,
  Space,
  Tabs,
} from "antd";
import {
  SendOutlined,
  UploadOutlined,
  CloseCircleFilled,
  SmileOutlined,
} from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import { stickers } from "../data/stickers";
import { useNavigate } from "react-router-dom";

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export default function ChatBox({ conversationId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [previewImages, setPreviewImages] = useState([]); // State giữ ảnh tạm thời
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [activeTab, setActiveTab] = useState("emoji");
  const navigate = useNavigate();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;

    socket.emit("join-conversation", conversationId);

    const onChatHistory = (msgs) => {
      setMessages(msgs);
    };

    const onReceiveMessage = (msg) => {
      console.log("📨 receive-message:", msg);
      const msgConvId =
        typeof msg.conversationId === "object"
          ? msg.conversationId.toString()
          : msg.conversationId;

      if (msgConvId !== conversationId) return; // 👈 QUAN TRỌNG

      setMessages((prev) => [...prev, msg]);
    };

    const onMessageRead = ({ conversationId: cId, userId }) => {
      setMessages((prev) =>
        prev.map((m) => {
          const mConvId =
            typeof m.conversationId === "object"
              ? m.conversationId.toString()
              : m.conversationId;

          if (mConvId !== cId) return m;

          const alreadyRead = m.readBy?.some(
            (u) => u._id?.toString() === userId,
          );

          if (alreadyRead) return m;

          return {
            ...m,
            readBy: [...(m.readBy || []), { _id: userId }],
          };
        }),
      );
    };

    const onConversationInfo = (conv) => {
      if (conv.isGroup) {
        setChatPartner({
          username: conv.name || "Nhóm chat",
          avatar: null,
        });
      } else {
        const partner = conv.members.find(
          (m) => m._id !== (user._id || user.id),
        );
        setChatPartner(partner);
      }
    };

    socket.on("chat-history", onChatHistory);
    socket.on("receive-message", onReceiveMessage);
    socket.on("conversation-read", onMessageRead);
    socket.on("conversation-info", onConversationInfo);

    return () => {
      socket.off("chat-history", onChatHistory);
      socket.off("receive-message", onReceiveMessage);
      socket.off("conversation-read", onMessageRead);
      socket.off("conversation-info", onConversationInfo);
      socket.emit("leave-conversation", conversationId);
    };
  }, [conversationId]);

  // HÀM CHỌN NHIỀU ẢNH
  const handleSelectImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024)
        return alert(`${file.name} quá lớn (>5MB)`);

      const reader = new FileReader();
      reader.onloadend = () => {
        // Thêm ảnh mới vào mảng cũ
        setPreviewImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null; // Reset để có thể chọn lại file vừa xóa
  };

  // HÀM XÓA 1 ẢNH TRONG DANH SÁCH PREVIEW
  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const send = () => {
    // Kiểm tra: nếu không có chữ VÀ không có ảnh nào trong mảng preview thì không làm gì cả
    if (!text.trim() && previewImages.length === 0) return;

    console.log("Đang gửi mảng ảnh:", previewImages.length);

    socket.emit("send-message", {
      conversationId,
      text: text.trim() || null,
      images: previewImages, // Gửi mảng previewImages
    });

    setText("");
    setPreviewImages([]); // Xóa sạch mảng sau khi gửi
  };

  const myId = user.id || user._id;

  const lastMyMessageId = [...messages].reverse().find((m) => {
    const senderId = typeof m.sender === "object" ? m.sender._id : m.sender;
    return senderId?.toString() === myId?.toString();
  })?._id;

  return (
    <Layout style={{ height: "100%", background: "#fff" }}>
      <input
        type="file"
        accept="image/*"
        hidden
        multiple
        ref={fileRef}
        onChange={handleSelectImages}
      />

      <Header
        style={{
          background: "#fff",
          padding: "0 20px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Avatar
          src={
            chatPartner?.avatar ||
            `https://api.dicebear.com/7.x/identicon/svg?seed=${conversationId}`
          }
          onClick={() => navigate(`/profile/${chatPartner._id}`)}
          style={{cursor: "pointer"}}
        />

        <Text strong style={{ marginLeft: 12 }}>
          {chatPartner?.username || "Phòng Chat"}
        </Text>
      </Header>

      <Content
        style={{
          padding: "20px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {messages.map((m) => {
          const isMe = (m.sender?._id || m.sender) === (user.id || user._id);
          return (
            <div
              key={m._id}
              style={{
                alignSelf: isMe ? "flex-end" : "flex-start",
                maxWidth: "70%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {!isMe && (
                <Text
                  size="small"
                  type="secondary"
                  style={{ marginLeft: 4, marginBottom: 2 }}
                >
                  {m.sender?.username}
                </Text>
              )}
              <div
                style={{
                  background: isMe ? "#1677ff" : "#f0f0f0",
                  color: isMe ? "#fff" : "#000",
                  padding: m.images?.length && !m.text ? "4px" : "8px 16px",
                  borderRadius: isMe ? "18px 18px 0 18px" : "18px 18px 18px 0",
                }}
              >
                {m.text && <div>{m.text}</div>}
                {m.images && m.images.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "5px",
                      marginTop: m.text ? 8 : 0,
                      justifyContent: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    {m.images.map((imgUrl, idx) => (
                      <Image
                        key={idx}
                        src={imgUrl}
                        style={{
                          width: "120px", // Chỉnh nhỏ lại để dàn hàng ngang cho đẹp
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {isMe && m._id === lastMyMessageId && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {m.readBy?.length > 1 ? "Đã xem" : "Đã gửi"}
                </Text>
              )}
            </div>
          );
        })}
        <div ref={scrollRef} />
      </Content>

      <Footer
        style={{
          background: "#fff",
          padding: "10px 20px",
          borderTop: "1px solid #f0f0f0",
          overflow: "visible", // ⭐ quan trọng để emoji picker không bị ẩn
        }}
      >
        {/* HIỂN THỊ DANH SÁCH ẢNH PREVIEW */}
        {previewImages.length > 0 && (
          <Space
            size="middle"
            style={{ marginBottom: 15, display: "flex", flexWrap: "wrap" }}
          >
            {previewImages.map((img, index) => (
              <Badge
                key={index}
                count={
                  <CloseCircleFilled
                    style={{ color: "#f5222d", cursor: "pointer" }}
                    onClick={() => removeImage(index)}
                  />
                }
              >
                <img
                  src={img}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
              </Badge>
            ))}
          </Space>
        )}

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileRef.current.click()}
            size="large"
            shape="circle"
          />
          <Input
            placeholder="Nhập tin nhắn..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPressEnter={send}
            size="large"
          />
          <Button
            icon={<SmileOutlined />}
            size="large"
            shape="circle"
            onClick={() => setShowEmoji((v) => !v)}
          />

          {/* EMOJI PICKER */}
          {showEmoji && (
            <div
              style={{
                position: "fixed",
                bottom: 90,
                right: 40,
                width: 330,
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,.15)",
                zIndex: 99999,
                overflow: "hidden",
              }}
            >
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                size="small"
                items={[
                  {
                    key: "emoji",
                    label: "😀 Emoji",
                    children: (
                      <EmojiPicker
                        height={300}
                        width="100%"
                        onEmojiClick={(emojiData) =>
                          setText((prev) => prev + emojiData.emoji)
                        }
                      />
                    ),
                  },
                  {
                    key: "sticker",
                    label: "🖼️ Sticker",
                    children: (
                      <div
                        style={{
                          height: 300,
                          overflowY: "auto",
                          padding: 10,
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 10,
                        }}
                      >
                        {stickers.map((s) => (
                          <img
                            key={s.id}
                            src={s.src}
                            style={{
                              width: 64,
                              cursor: "pointer",
                              borderRadius: 8,
                            }}
                            onClick={() => {
                              socket.emit("send-message", {
                                conversationId,
                                text: null,
                                images: [s.src], // gửi URL sticker
                              });
                              setShowEmoji(false);
                            }}
                          />
                        ))}
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          )}

          <Button
            type="primary"
            shape="circle"
            icon={<SendOutlined />}
            onClick={send}
            size="large"
          />
        </div>
      </Footer>
    </Layout>
  );
}
