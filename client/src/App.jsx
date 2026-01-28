import { useState, useEffect } from "react";
import axios from "axios";
import { socket } from "./socket";
import Login from "./components/Login";
import Register from "./components/Register";
import ConversationList from "./components/ConversationList";
import ChatBox from "./components/ChatBox";
import Navbar from "./components/Navbar";
// THÊM Modal và Typography vào đây
import { Layout, Spin, ConfigProvider, Modal, Typography } from "antd";

const { Sider, Content } = Layout;
const { Title } = Typography;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Định nghĩa nhanh WelcomeScreen để không bị lỗi trắng trang
const WelcomeScreen = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      background: "#f9f9f9",
      color: "#8c8c8c",
    }}
  >
    <h3>Chọn một cuộc trò chuyện để bắt đầu</h3>
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Chỉ cần 1 useEffect này là đủ
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get(`${BACKEND_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data.user);
          setIsModalOpen(false);
          socket.auth = { token };
          socket.connect();
        } catch {
          localStorage.removeItem("token");
          setIsModalOpen(true);
        }
      } else {
        setIsModalOpen(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang khởi động FuwaChat..." />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{ token: { colorPrimary: "#1677ff", borderRadius: 8 } }}
    >
      <Layout style={{ height: "100vh" }}>
        <Navbar
          user={user}
          onLogout={handleLogout}
          onNavigate={setAuthMode} // Thêm cái này để đổi mode login/reg
          openAuth={() => setIsModalOpen(true)}
        />

        <Layout style={{ height: "calc(100vh - 64px)" }}>
          {user ? (
            <>
              <Sider
                width={350}
                theme="light"
                style={{ borderRight: "1px solid #f0f0f0" }}
              >
                <ConversationList user={user} onSelect={setConversationId} />
              </Sider>
              <Content style={{ background: "#fff" }}>
                {conversationId ? (
                  <ChatBox conversationId={conversationId} user={user} />
                ) : (
                  <WelcomeScreen />
                )}
              </Content>
            </>
          ) : (
            <Content
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f0f2f5",
              }}
            >
              <Title level={4} type="secondary">
                Vui lòng đăng nhập để sử dụng FuwaChat
              </Title>
            </Content>
          )}
        </Layout>

        <Modal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          closable={true}
          maskClosable={true}
          footer={null}
          width={450}
          centered
          destroyOnClose
        >
          {authMode === "login" ? (
            <Login
              onLogin={(u) => {
                setUser(u);
                setIsModalOpen(false);
              }}
              onNavigate={setAuthMode}
            />
          ) : (
            <Register onNavigate={setAuthMode} />
          )}
        </Modal>
      </Layout>
    </ConfigProvider>
  );
}
