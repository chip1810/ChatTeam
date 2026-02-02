import { useEffect, useState, useCallback } from "react";
import { List, Avatar, Typography, Divider, Spin } from "antd";
import conversationService from "../services/conversationService";
import { socket } from "../socket";

const { Title } = Typography;

export default function ConversationSideBar({ user, onSelect }) {
  const [convs, setConvs] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleSelect = (convId) => {
    setConvs((prev) =>
      prev.map((c) => (c._id === convId ? { ...c, isRead: true } : c)),
    );

    onSelect(convId);

    socket.emit("mark-read", { conversationId: convId });
  };

  const loadConversations = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const res = await conversationService.getConversations(page);

    setConvs((prev) => [...prev, ...res.data]);
    setPage((prev) => prev + 1);

    if (res.data.length < 10) setHasMore(false);
    setLoading(false);
  }, [page, loading, hasMore]);

  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);

      const res = await conversationService.getConversations(0);

      setConvs(res.data);
      setPage(1);
      setHasMore(res.data.length === 10);

      setLoading(false);
    };

    initLoad();
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    const handler = ({ conversationId, lastMessage, isRead }) => {
      setConvs((prev) => {
        const exists = prev.find((c) => c._id === conversationId);

        // ✅ Nếu conversation đã tồn tại
        if (exists) {
          return [
            {
              ...exists,
              lastMessage,
              isRead,
            },
            ...prev.filter((c) => c._id !== conversationId),
          ];
        }

        // ❗ Nếu chưa có (hiếm) → bỏ qua hoặc fetch thêm
        return prev;
      });
    };

    socket.on("conversation-updated", handler);
    return () => socket.off("conversation-updated", handler);
  }, [user]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadConversations();
    }
  };

  return (
    <div
      style={{ height: "100%", padding: 16, overflowY: "auto" }}
      onScroll={handleScroll}
    >
      <Title level={4}>Tin nhắn</Title>
      <Divider />

      <List
        dataSource={convs}
        renderItem={(conv) => {
          // 1–1 → lấy người còn lại
          const otherUser =
            !conv.isGroup &&
            conv.members.find((m) => m._id !== (user._id || user.id));

          const name = conv.isGroup
            ? conv.name || "Nhóm chat"
            : otherUser?.username;

          const avatar = conv.isGroup ? null : otherUser?.avatar;

          return (
            <List.Item
              onClick={() => handleSelect(conv._id)}
              style={{ cursor: "pointer", padding: 12 }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={
                      avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
                    }
                  />
                }
                title={name}
                description={
                  <span
                    style={{
                      fontWeight: conv.isRead ? 400 : 700,
                      color: conv.isRead ? "#555" : "#000",
                      position: "relative",
                      paddingLeft: conv.isRead ? 0 : 12,
                    }}
                  >
                    {!conv.isRead && (
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#1677ff", // Ant Design blue
                        }}
                      />
                    )}
                    {conv.lastMessage?.text || "Chưa có tin nhắn"}
                  </span>
                }
              />
            </List.Item>
          );
        }}
      />

      {loading && (
        <div style={{ textAlign: "center", padding: 12 }}>
          <Spin />
        </div>
      )}

      {!hasMore && (
        <div style={{ textAlign: "center", color: "#999" }}>
          Hết cuộc trò chuyện rồi 👀
        </div>
      )}
    </div>
  );
}
