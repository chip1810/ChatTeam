import api from "./api";

const eventService = {
  // Lấy danh sách sự kiện (Public + Được mời)
  getEvents() {
    return api.get("/api/events");
  },

  // Tạo sự kiện mới
  createEvent(eventData) {
    /* eventData: { title, description, invitedUserIds, isPublic, eventDate } 
    */
    return api.post("/api/events", eventData);
  },

  // Cập nhật trạng thái tham gia (viewed, joined, declined)
  updateStatus(eventId, status) {
    return api.patch(`/api/events/${eventId}/status`, { status });
  }
};

export default eventService;