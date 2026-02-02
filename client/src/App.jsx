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
import ChatBox from "./components/ChatBox";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import OtherProfile from "./pages/OtherProfile";
import Home from "./pages/ChatHome";
import EventDashboard from "./pages/EventDashboard";

const { Title } = Typography;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function App() {
  const [user, setUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // 1. Gom logic lấy user vào 1 hàm dùng chung
  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsModalOpen(true);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setIsModalOpen(false);

      // Kết nối socket
      socket.auth = { token };
      socket.connect();
    } catch (error) {
      console.error("Auth error:", error);
      localStorage.removeItem("token");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // 2. Dùng trong useEffect khi load trang
  useEffect(() => {
    fetchUserInfo();
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
    <ConfigProvider theme={{ token: { colorPrimary: "#1677ff", borderRadius: 8 } }}>
      <Router>
        <Layout style={{ height: "100vh" }}>
          <Navbar
            user={user}
            onLogout={handleLogout}
            openAuth={() => setIsModalOpen(true)}
            onNavigate={setAuthMode}
          />

          <Layout style={{ height: "calc(100vh - 64px)" }}>
            <Routes>
              <Route
                path="/" // Nên để path rõ ràng là /events hoặc /forum
                element={
                  user ? (
                    <EventDashboard
                      user={user} // Truyền object user đang đăng nhập vào đây
                    />
                  ) : (
                    <div style={{
                      display: "flex",
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      background: "#f0f2f5",
                      height: "100vh"
                    }}>
                      <Title level={4} type="secondary">
                        Vui lòng đăng nhập để sử dụng FuwaEvent
                      </Title>
                    </div>
                  )
                }
              />
              <Route
                path="/chat"
                element={
                  user ? (
                    <Home
                      user={user}
                      conversationId={conversationId}
                      setConversationId={setConversationId}
                    />
                  ) : (
                    <div style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center", background: "#f0f2f5" }}>
                      <Title level={4} type="secondary">Vui lòng đăng nhập để sử dụng FuwaChat</Title>
                    </div>
                  )
                }
              />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
              <Route path="/profile/:userId" element={user ? <OtherProfile /> : <Navigate to="/" />} />
              <Route path="/game" element={<GameLobby user={user} />} />
              <Route path="/game/:roomId" element={<GameRoom user={user} />} />
            </Routes>
          </Layout>

          {/* Modal Auth giữ nguyên... */}
          <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={450} centered destroyOnHidden>
            {authMode === "login" ? (
              <Login onLogin={fetchUserInfo} onNavigate={setAuthMode} /> // fetchUserInfo là hàm gom nhóm logic login
            ) : (
              <Register onNavigate={setAuthMode} />
            )}
          </Modal>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}
