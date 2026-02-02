import api from "./api";

const conversationService = {
  getChatUsers(page, limit = 10) {
    return api.get("/api/conversations/users", {
      params: { page, limit },
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
