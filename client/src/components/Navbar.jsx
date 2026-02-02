import { Layout, Button, Typography, Space, Avatar, Dropdown, Menu } from "antd";
import { UserOutlined, LogoutOutlined, LoginOutlined, UserAddOutlined, AppstoreOutlined, MessageOutlined  } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Title, Text } = Typography;

export default function Navbar({ user, onLogout, onNavigate, openAuth }) {
  const navigate = useNavigate();
  // Menu cho Dropdown khi bấm vào Avatar
  const userMenuItems = [
    {
      key: "profile",
      label: "Trang cá nhân",
      icon: <UserOutlined />,
      onClick: () => navigate("/profile"), // Đi tới trang profile
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: onLogout,
    },
  ];

  const navigationItems = [
    {
      key: "/",
      label: "Diễn đàn",
      icon: <AppstoreOutlined />,
      onClick: () => navigate("/"),
    },
    {
      key: "/chat",
      label: "Tin nhắn",
      icon: <MessageOutlined />,
      onClick: () => navigate("/chat"),
    },
  ];

  return (
    <Header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#fff',
      padding: '0 20px',
      borderBottom: '1px solid #f0f0f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      zIndex: 1000 // Tăng zIndex lên cao hẳn
    }}>
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate("/")}>
        <Title level={3} style={{ margin: 0, color: '#1677ff' }}>FuwaChat</Title>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {user && (
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]} // Tự động sáng tab đang đứng
            items={navigationItems}
            style={{ borderBottom: 'none', minWidth: 300, justifyContent: 'center' }}
          />
        )}
      </div>

      <Space size="middle">
        {user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
              <Text strong>{user.username}</Text>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            {/* Chú ý: onNavigate ở đây là hàm setAuthMode của App */}
            <Button onClick={() => { onNavigate('login'); openAuth(); }}>
              Đăng nhập
            </Button>
            <Button
              type="primary"
              onClick={() => { onNavigate('register'); openAuth(); }}
            >
              Đăng ký
            </Button>
          </Space>
        )}
      </Space>
    </Header>
  );
}