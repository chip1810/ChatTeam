import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Select,
  DatePicker,
  message,
  Spin,
  Typography,
  Divider,
  Badge,
  Layout,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  EditOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form] = Form.useForm();
  const [newAvatarBase64, setNewAvatarBase64] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await authService.getMe(token);
      const data = res.data;
      setProfile(data);
      setAvatarPreview(data.avatar || null);
      form.setFieldsValue({
        displayName: data.displayName,
        bio: data.bio,
        phoneNumber: data.phoneNumber,
        address: data.address,
        gender: data.gender,
        dob: data.dob ? dayjs(data.dob) : null,
      });
    } catch {
      message.error("Không thể lấy dữ liệu hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (info) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      setAvatarPreview(base64Image);

      setUpdating(true);
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `${BACKEND_URL}/api/profile/update`,
          { avatarBase64: base64Image },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        // HIỆN THÔNG BÁO TRƯỚC
        message.success("Đã cập nhật ảnh đại diện!");

        // THAY VÌ RELOAD, HÃY GỌI LẠI HÀM FETCH ĐỂ CẬP NHẬT UI
        await fetchProfile();
      } catch (err) {
        console.error(err);
        message.error("Không thể lưu ảnh lên máy chủ");
      } finally {
        setUpdating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onFinish = async (values) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...values,
        avatarBase64: newAvatarBase64,
      };
      await axios.put(`${BACKEND_URL}/api/profile/update`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
      setNewAvatarBase64(null);
      fetchProfile();
    } catch {
      message.error("Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const disabledDate = (current) => {
    // Không cho phép chọn ngày sau ngày hôm nay
    return current && current > dayjs().endOf("day");
  };


  return (
    
    <Layout style={{ height: "100%", background: "#fff" }}>
      {/* Header trang Profile giống Header Chat */}
      <Spin spinning={loading} tip="Đang tải hồ sơ..." fullscreen></Spin>
      <div
        style={{
          padding: "15px 25px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/")} />
          <Title level={4} style={{ margin: 0 }}>
            Hồ sơ cá nhân
          </Title>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {!isEditing ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa
            </Button>
          ) : (
            <>
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  setIsEditing(false);
                  // Gán lại dữ liệu cũ từ state profile vào form
                  form.setFieldsValue({
                    displayName: profile.displayName,
                    bio: profile.bio,
                    phoneNumber: profile.phoneNumber,
                    address: profile.address,
                    gender: profile.gender,
                    dob: profile.dob ? dayjs(profile.dob) : null,
                  });
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={updating}
                onClick={() => form.submit()}
              >
                Lưu thay đổi
              </Button>
            </>
          )}
        </div>
      </div>

      <Content style={{ padding: "40px", overflowY: "auto" }}>
        <Row gutter={64} style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Cột bên trái: Avatar & General Info */}
          <Col xs={24} md={8} style={{ textAlign: "center", marginBottom: 30 }}>
            <Badge
              dot
              status={updating ? "processing" : "default"} // Đổi trạng thái khi đang up
              offset={[-15, 135]}
              style={{ width: 20, height: 20 }}
            >
              <Spin spinning={updating} fullscreen={false}>
                {" "}
                {/* Thêm Spin bao quanh Avatar */}
                <Avatar
                  size={160}
                  src={avatarPreview || null}
                  icon={<UserOutlined />}
                  style={{ border: "4px solid #f0f2f5" }}
                />
              </Spin>
            </Badge>
            <div style={{ marginTop: 20 }}>
              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleAvatarChange} // Gọi hàm tự động lưu
                disabled={!isEditing || updating} // Khóa nút khi đang up
              >
                <Button icon={<UploadOutlined />} loading={updating} disabled={!isEditing || updating}>
                  {updating ? "Đang tải lên..." : "Thay đổi ảnh"}
                </Button>
              </Upload>
            </div>
            <Divider />
            <div style={{ textAlign: "left" }}>
              <Text type="secondary">Tên tài khoản</Text>
              <Title level={5} style={{ marginTop: 5 }}>
                {profile?.user?.username}
              </Title>
              <Text type="secondary">Email liên hệ</Text>
              <Title level={5} style={{ marginTop: 5 }}>
                {profile?.user?.email}
              </Title>
            </div>
          </Col>

          {/* Cột bên phải: Form chỉnh sửa */}
          <Col xs={24} md={16}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              disabled={!isEditing}
            >
              <Title level={5}>Thông tin cơ bản</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Họ và Tên"
                    name="displayName"
                    rules={[
                      { max: 50, message: "Tên không được quá 50 ký tự" },
                      {
                        whitespace: true,
                        message: "Tên không được chỉ chứa khoảng trắng",
                      },
                    ]}
                  >
                    <Input size="large" placeholder="Ví dụ: Nguyễn Văn A" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phoneNumber"
                    rules={[
                      {
                        pattern: /^[0-9]+$/,
                        message: "Số điện thoại chỉ được chứa chữ số!",
                      },
                      {
                        len: 10,
                        message: "Số điện thoại phải có đúng 10 chữ số!",
                      },
                    ]}
                  >
                    <Input size="large" placeholder="09xx xxx xxx" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Giới tính" name="gender">
                    <Select
                      size="large"
                      options={[
                        { value: "Male", label: "Nam" },
                        { value: "Female", label: "Nữ" },
                        { value: "Other", label: "Khác" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Ngày sinh"
                    name="dob"
                    rules={[
                      {
                        type: "object",
                        message: "Vui lòng chọn ngày sinh hợp lệ!",
                      },
                    ]}
                  >
                    <DatePicker
                      size="large"
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      disabledDate={disabledDate} // 👈 CHẶN NGÀY TƯƠNG LAI
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Địa chỉ" name="address">
                <Input
                  size="large"
                  placeholder="Số nhà, tên đường, thành phố..."
                />
              </Form.Item>

              <Divider />

              <Title level={5}>Về bản thân</Title>
              <Form.Item
                name="bio"
                rules={[{ max: 500, message: "Giới thiệu tối đa 500 ký tự" }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Chia sẻ một chút về sở thích hoặc phương châm sống của bạn..."
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Content>
      
    </Layout>
  );
}
