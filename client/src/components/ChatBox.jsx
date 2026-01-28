import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import { Input, Button, Layout, Avatar, List, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export default function ChatBox({ conversationId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.emit("join-conversation", conversationId);
    socket.on("chat-history", msgs => setMessages(msgs));
    socket.on("receive-message", msg => setMessages(prev => [...prev, msg]));

    return () => {
      socket.off("chat-history");
      socket.off("receive-message");
    };
  }, [conversationId]);

  const send = () => {
    if (!text.trim()) return;
    socket.emit("send-message", { conversationId, text });
    setText("");
  };

  return (
    <Layout style={{ height: "100%", background: "#fff" }}>
      <Header style={{ background: "#fff", padding: "0 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
        <Avatar src={`https://api.dicebear.com/7.x/identicon/svg?seed=${conversationId}`} />
        <Text strong style={{ marginLeft: 12 }}>Phòng Chat</Text>
      </Header>

      <Content style={{ padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.map((m) => {
          const isMe = m.sender._id === user.id || m.sender === user.id;
          return (
            <div key={m._id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "70%", display: "flex", flexDirection: "column" }}>
              {!isMe && <Text size="small" type="secondary" style={{ marginLeft: 4, marginBottom: 2 }}>{m.sender.username}</Text>}
              <div style={{
                background: isMe ? "#1677ff" : "#f0f0f0",
                color: isMe ? "#fff" : "#000",
                padding: "8px 16px",
                borderRadius: isMe ? "18px 18px 0 18px" : "18px 18px 18px 0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </Content>

      <Footer style={{ background: "#fff", padding: "10px 20px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <Input
            placeholder="Nhập tin nhắn..."
            value={text}
            onChange={e => setText(e.target.value)}
            onPressEnter={send} // Nhấn Enter để gửi
            size="large"
            style={{ borderRadius: "20px" }}
          />
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