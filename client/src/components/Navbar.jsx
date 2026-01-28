import { Layout, Button, Typography, Space, Avatar, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined, LoginOutlined, UserAddOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Title, Text } = Typography;

export default function Navbar({ user, onLogout, onNavigate, openAuth }) {
  // Menu cho Dropdown khi bấm vào Avatar
  const userMenuItems = [
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: onLogout,
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
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => onNavigate('home')}>
        <Title level={3} style={{ margin: 0, color: '#1677ff' }}>FuwaChat</Title>
      </div>

      <Space size="middle">
        {user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
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