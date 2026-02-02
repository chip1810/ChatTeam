import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // Thêm BrowserRouter
import axios from "axios";
import { socket } from "./socket";
import { Layout, Spin, ConfigProvider, Modal, Typography } from "antd";

// Components
import Login from "./components/Login";
import Register from "./components/Register";
import ConversationList from "./components/ConversationList";
import ChatBox from "./components/ChatBox";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import ConversationSideBar from "./components/ConversationSidebar";
import OtherProfile from "./components/OtherProfile";

const { Sider, Content } = Layout;
const { Title } = Typography;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Giao diện Chat tách riêng cho gọn
const ChatHome = ({ user, conversationId, setConversationId }) => (
  <Layout style={{ height: "100%" }}>
    <Sider
      width={350}
      theme="light"
      style={{ borderRight: "1px solid #f0f0f0" }}
    >
      <ConversationSideBar user={user} onSelect={setConversationId} />
    </Sider>
    <Content style={{ background: "#fff" }}>
      {conversationId ? (
        <ChatBox conversationId={conversationId} user={user} />
      ) : (
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
      )}
    </Content>
  </Layout>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

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
          console.log("🟢 socket connected:", socket.id);
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
    window.location.href = "/"; // Reset toàn bộ về trang chủ
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
        <Spin size="large" fullscreen tip="Đang khởi động FuwaChat..." />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{ token: { colorPrimary: "#1677ff", borderRadius: 8 } }}
    >
      <Router>
        {" "}
        {/* Bọc Router ở đây */}
        <Layout style={{ height: "100vh" }}>
          <Navbar
            user={user}
            onLogout={handleLogout}
            // Loại bỏ onNavigate rườm rà ở đây
            openAuth={() => setIsModalOpen(true)}
            setAuthMode={setAuthMode} // Truyền để Navbar biết mở login hay register
          />

          <Layout style={{ height: "calc(100vh - 64px)" }}>
            <Routes>
              <Route
                path="/"
                element={
                  user ? (
                    <ChatHome
                      user={user}
                      conversationId={conversationId}
                      setConversationId={setConversationId}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        background: "#f0f2f5",
                      }}
                    >
                      <Title level={4} type="secondary">
                        Vui lòng đăng nhập để sử dụng FuwaChat
                      </Title>
                    </div>
                  )
                }
              />

              <Route
                path="/profile"
                element={user ? <Profile /> : <Navigate to="/" />}
              />
              <Route
                path="/profile/:userId"
                element={user ? <OtherProfile /> : <Navigate to="/" />}
              />
            </Routes>
          </Layout>

          <Modal
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            width={450}
            centered
            destroyOnHidden
          >
            {authMode === "login" ? (
              <Login
                onLogin={async () => {
                  const token = localStorage.getItem("token");
                  const res = await axios.get(`${BACKEND_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setUser(res.data.user);
                  setIsModalOpen(false);
                  socket.auth = { token };
                  socket.connect();
                }}
                onNavigate={setAuthMode}
              />
            ) : (
              <Register onNavigate={setAuthMode} />
            )}
          </Modal>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}
