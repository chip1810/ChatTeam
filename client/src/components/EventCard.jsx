import { Card, Tag, Button, Typography, Space, Tooltip } from "antd";
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  QuestionCircleOutlined, 
  UserOutlined,
  CalendarOutlined,
  CrownOutlined 
} from "@ant-design/icons";

const { Text } = Typography;

export default function EventCard({ event, userId, onUpdateStatus }) {
  const myInvitation = event.invitedUsers?.find(u => (u.user._id || u.user) === userId);
  const isOwner = (event.admin._id || event.admin) === userId;
  const currentStatus = myInvitation?.status || "pending";

  // Hàm render Tag trạng thái dựa trên status
  const renderStatusTag = () => {
    switch (currentStatus) {
      case "joined":
        return <Tag icon={<CheckCircleOutlined />} color="blue">Sẽ tham gia</Tag>;
      case "declined":
        return <Tag icon={<CloseCircleOutlined />} color="error">Đã từ chối</Tag>;
      case "viewed":
        return <Tag icon={<QuestionCircleOutlined />} color="warning">Đang cân nhắc</Tag>;
      default:
        return <Tag color="default">Chưa phản hồi</Tag>;
    }
  };

  return (
    <Card 
      hoverable
      style={{ borderRadius: 12, marginBottom: 16 }}
      title={<Text strong>{event.title}</Text>} 
      extra={event.isPublic ? <Tag color="green">Công khai</Tag> : <Tag color="gold">Riêng tư</Tag>}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 10 }}>
          {event.description}
        </Text>
        
        <Space direction="vertical" size={4}>
          <Text type="secondary" size="small"><UserOutlined /> Chủ trì: <b>{event.admin?.username}</b></Text>
          {event.eventDate && (
            <Text type="secondary" size="small">
              <CalendarOutlined /> {new Date(event.eventDate).toLocaleString('vi-VN')}
            </Text>
          )}
        </Space>
      </div>

      <Space wrap style={{ width: '100%', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
        <div>{isOwner ? <Tag icon={<CrownOutlined />} color="volcano">Admin</Tag> : renderStatusTag()}</div>

        {!isOwner && (
          <Button.Group>
            <Tooltip title="Tham gia">
              <Button 
                icon={<CheckCircleOutlined />}
                type={currentStatus === "joined" ? "primary" : "default"}
                onClick={() => onUpdateStatus(event._id, "joined")}
              />
            </Tooltip>
            
            <Tooltip title="Suy nghĩ thêm">
              <Button 
                icon={<QuestionCircleOutlined />}
                type={currentStatus === "viewed" ? "primary" : "default"}
                onClick={() => onUpdateStatus(event._id, "viewed")}
              />
            </Tooltip>

            <Tooltip title="Từ chối">
              <Button 
                danger
                icon={<CloseCircleOutlined />}
                type={currentStatus === "declined" ? "primary" : "default"}
                onClick={() => onUpdateStatus(event._id, "declined")}
              />
            </Tooltip>
          </Button.Group>
        )}
      </Space>
    </Card>
  );
}