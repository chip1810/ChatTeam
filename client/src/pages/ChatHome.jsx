import { Layout } from "antd";
import ConversationSideBar from "../components/ConversationSidebar";
import ChatBox from "../components/ChatBox";

const { Sider, Content } = Layout;

const Home = ({ user, conversationId, setConversationId }) => {
  return (
    <Layout style={{ height: "100%" }}>
      <Sider
        width={350}
        theme="light"
        style={{ borderRight: "1px solid #f0f0f0" }}
      >
        <ConversationSideBar user={user} onSelect={setConversationId} />
      </Sider>
      <Content style={{ background: "#fff" }}>
        {conversationId ? (
          <ChatBox conversationId={conversationId} user={user} />
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              background: "#f9f9f9",
              color: "#8c8c8c",
            }}
          >
            <h3>Chọn một cuộc trò chuyện để bắt đầu</h3>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Home;