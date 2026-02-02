import api from "./api";

const conversationService = {
  getChatUsers(search = "", page = 0, limit = 10) {
    return api.get("/api/conversations/users", {
      params: { search, page, limit }, // Gửi search lên backend
    });
  },

  startPrivateChat(userId) {
    return api.post("/api/conversations", {
      memberIds: [userId],
      isGroup: false,
    });
  },
  getConversations(page, limit = 10) {
    return api.get("/api/conversations", {
      params: { page, limit },
    });
  },
};

export default conversationService;
