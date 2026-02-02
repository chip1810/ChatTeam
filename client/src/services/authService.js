import api from "./api";

const authService = {
  login(data) {
    return api.post("/api/auth/login", data);
  },

  register(data) {
    return api.post("/api/auth/register", data);
  },

  getMe() {
    return api.get("/api/profile/me");
  },

  // services/profileService.js
  getProfileById(userId) {
    return api.get(`/api/profile/${userId}`);
  },

  logout() {
    localStorage.removeItem("token");
  },
};

export default authService;
