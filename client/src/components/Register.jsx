import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function Register({ onNavigate }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/register`, values);
      message.success(res.data.message || "Đăng ký thành công!");
      
      // Chuyển sang form Login ngay lập tức trong cùng 1 Modal
      onNavigate('login');
    } catch (err) {
      message.error(err.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "10px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Title level={3} style={{ color: '#1677ff', marginBottom: 4 }}>Tạo tài khoản</Title>
        <Text type="secondary">Gia nhập cộng đồng FuwaChat</Text>
      </div>

      <Form
        name="register_form"
        onFinish={onFinish}
        layout="vertical"
        size="large"
        requiredMark={false}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Bạn tên là gì nhỉ?" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Tên hiển thị" />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Nhập email nhé!" },
            { type: "email", message: "Email không đúng định dạng!" }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Mật khẩu là bắt buộc!" },
            { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: "Xác nhận lại mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            loading={loading}
            style={{ height: 45, borderRadius: 8 }}
          >
            Đăng ký ngay
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          <Text type="secondary">Đã có tài khoản? </Text>
          <Button type="link" onClick={() => onNavigate('login')} style={{ padding: 0 }}>
            Đăng nhập thôi
          </Button>
        </div>
      </Form>
    </div>
  );
}