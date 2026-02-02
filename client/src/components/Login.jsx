import { useState } from "react";
import { socket } from "../socket";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import authService from "../services/authService";

const { Title, Text } = Typography;

export default function Login({ onLogin, onNavigate }) {
  const [loading, setLoading] = useState(false);

  // values = { identifier, password }
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 👉 gọi qua service
      const res = await authService.login(values);

      const { token, user } = res.data;

      localStorage.setItem("token", token);

      socket.auth = { token };
      socket.connect();

      message.success("Đăng nhập thành công!");
      onLogin(user);
    } catch (err) {
      message.error(
        err.response?.data?.message || "Sai tài khoản hoặc mật khẩu!"
      );
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
        <Form.Item
          name="identifier"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập email hoặc tên đăng nhập!",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email hoặc tên đăng nhập"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Mật khẩu"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          style={{ height: 45 }}
        >
          Đăng nhập
        </Button>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          Chưa có tài khoản?{" "}
          <Button type="link" onClick={() => onNavigate("register")}>
            Đăng ký ngay
          </Button>
        </div>
      </Form>
    </div>
  );
}
