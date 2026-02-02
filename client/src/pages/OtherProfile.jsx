import React, { useEffect, useState } from "react";
import {
  Layout,
  Avatar,
  Typography,
  Spin,
  Divider,
  Row,
  Col,
  Button,
  message,
} from "antd";
import { UserOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import authService from "../services/authService";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function OtherProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await authService.getProfileById(userId);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải hồ sơ người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Render Spin toàn màn hình khi đang tải dữ liệu lần đầu
  if (loading) {
    return <Spin fullscreen tip="Đang tải hồ sơ..." size="large" />;
  }

  if (!profile) return null;

  return (
    <Layout style={{ height: "100%", background: "#fff" }}>
      {/* HEADER - Đồng bộ với trang cá nhân */}
      <div
        style={{
          padding: "15px 25px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        />
        <Title level={4} style={{ margin: 0 }}>
          Hồ sơ người dùng
        </Title>
      </div>

      <Content style={{ padding: "40px", overflowY: "auto" }}>
        <Row gutter={64} style={{ maxWidth: 1200, margin: "0 auto" }}>
          
          {/* CỘT TRÁI: Avatar & Thông tin tài khoản */}
          <Col xs={24} md={8} style={{ textAlign: "center", marginBottom: 30 }}>
            <Avatar
              size={160}
              src={profile.avatar || null}
              icon={<UserOutlined />}
              style={{ border: "4px solid #f0f2f5" }}
            />
            
            <Divider />
            
            <div style={{ textAlign: "left" }}>
              <Text type="secondary">Tên tài khoản</Text>
              <Title level={5} style={{ marginTop: 5, marginBottom: 15 }}>
                {profile.user?.username}
              </Title>
              
              <Text type="secondary">Email liên hệ</Text>
              <Title level={5} style={{ marginTop: 5 }}>
                {profile.user?.email}
              </Title>
            </div>
          </Col>

          {/* CỘT PHẢI: Chi tiết hồ sơ (Chỉ xem) */}
          <Col xs={24} md={16}>
            <Title level={5}>Thông tin cơ bản</Title>
            
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 20 }}>
                  <Text type="secondary">Họ và Tên</Text>
                  <div style={{ fontSize: "16px", marginTop: 5 }}>
                    {profile.displayName || "—"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 20 }}>
                  <Text type="secondary">Số điện thoại</Text>
                  <div style={{ fontSize: "16px", marginTop: 5 }}>
                    {profile.phoneNumber || "—"}
                  </div>
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 20 }}>
                  <Text type="secondary">Giới tính</Text>
                  <div style={{ fontSize: "16px", marginTop: 5 }}>
                    {profile.gender === "Male" ? "Nam" : profile.gender === "Female" ? "Nữ" : profile.gender === "Other" ? "Khác" : "—"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 20 }}>
                  <Text type="secondary">Ngày sinh</Text>
                  <div style={{ fontSize: "16px", marginTop: 5 }}>
                    {profile.dob ? dayjs(profile.dob).format("DD/MM/YYYY") : "—"}
                  </div>
                </div>
              </Col>
            </Row>

            <div style={{ marginBottom: 20 }}>
              <Text type="secondary">Địa chỉ</Text>
              <div style={{ fontSize: "16px", marginTop: 5 }}>
                {profile.address || "—"}
              </div>
            </div>

            <Divider />

            <Title level={5}>Về bản thân</Title>
            <div style={{ 
              fontSize: "16px", 
              lineHeight: "1.6", 
              background: "#f9f9f9", 
              padding: "15px", 
              borderRadius: "8px",
              minHeight: "100px" 
            }}>
              {profile.bio || "Người dùng này khá bí ẩn, chưa có lời giới thiệu nào."}
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}