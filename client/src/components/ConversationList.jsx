import { useEffect, useState, useCallback, useRef } from "react";
import { List, Avatar, Typography, Divider, Spin } from "antd";
import conversationService from "../services/conversationService";

const { Title } = Typography;


export default function ConversationList({ onSelect }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const firstLoadRef = useRef(false);
  


  const loadUsers = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const res = await conversationService.getChatUsers(page);

    setUsers((prev) => [...prev, ...res.data]);
    setPage((prev) => prev + 1);

    if (res.data.length < 10) setHasMore(false);
    setLoading(false);
  }, [page, loading, hasMore]);

  useEffect(() => {
    if (firstLoadRef.current) return;
    firstLoadRef.current = true;
    (async () => {
      await loadUsers();
    })();
  }, []);

  

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    // Gần chạm đáy
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadUsers();
    }
  };

  const startChat = async (userId) => {
    const res = await conversationService.startPrivateChat(userId);
    onSelect(res.data._id);
  };

  return (
    <div
      style={{ height: "100%", padding: 16, overflowY: "auto" }}
      onScroll={handleScroll}
    >
      <Title level={4}>Tin nhắn</Title>
      <Divider />

      <List
        dataSource={users}
        renderItem={(u) => (
          <List.Item
            onClick={() => startChat(u._id)}
            style={{ cursor: "pointer", padding: 12 }}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  src={
                    u.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                  }
                />
              }
              title={u.username}
              
            />
            
          </List.Item>
        )}
      />

      {loading && (
        <div style={{ textAlign: "center", padding: 12 }}>
          <Spin />
        </div>
      )}

      {!hasMore && (
        <div style={{ textAlign: "center", color: "#999" }}>
          Hết người rồi 👀
        </div>
      )}
    </div>
  );
}
