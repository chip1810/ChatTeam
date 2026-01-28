import { useState } from "react";
import axios from "axios";
import { socket } from "../socket";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function Login({ onLogin, onNavigate }) {
  const [loading, setLoading] = useState(false);

  // values sẽ chứa { email, password } lấy từ name của Input
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, values);

      localStorage.setItem("token", res.data.token);
      socket.auth = { token: res.data.token };
      socket.connect();

      message.success("Đăng nhập thành công!");
      onLogin(res.data.user);
    } catch (err) {
      message.error(err.response?.data?.message || "Sai tài khoản hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px 10px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Title level={3}>FuwaChat</Title>
        <Text type="secondary">Chào mừng bạn quay trở lại!</Text>
      </div>

      <Form onFinish={onFinish} layout="vertical" size="large">
        <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
          <Input prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 45 }}>
          Đăng nhập
        </Button>
        
        <div style={{ textAlign: "center", marginTop: 16 }}>
          Chưa có tài khoản? <Button type="link" onClick={() => onNavigate('register')}>Đăng ký ngay</Button>
        </div>
      </Form>
    </div>
  );
}