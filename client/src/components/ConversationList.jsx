import { useEffect, useState } from "react";
import axios from "axios";
import { List, Avatar, Typography, Divider, Skeleton } from "antd";

const { Title } = Typography;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function ConversationList({ onSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/conversations/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => {
      setUsers(res.data);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  const startChat = async (userId) => {
    const res = await axios.post(
      `${BACKEND_URL}/api/conversations`,
      { memberIds: [userId], isGroup: false },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    onSelect(res.data._id);
  };

  return (
    <div style={{ height: "100%", padding: "16px", overflowY: "auto" }}>
      <Title level={4} style={{ marginBottom: 20 }}>Tin nhắn</Title>
      <Divider style={{ margin: "12px 0" }} />
      
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={users}
        renderItem={(u) => (
          <List.Item
            onClick={() => startChat(u._id)}
            style={{ 
              cursor: "pointer", 
              padding: "12px", 
              borderRadius: "8px",
              transition: "all 0.3s" 
            }}
            className="user-item-hover" // Bạn có thể thêm CSS hover trong index.css
          >
            <List.Item.Meta
              avatar={<Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} />}
              title={<span style={{ fontWeight: 600 }}>{u.username}</span>}
              description={<span style={{ fontSize: "12px" }}>Nhấn để bắt đầu chat</span>}
            />
          </List.Item>
        )}
      />
    </div>
  );
}