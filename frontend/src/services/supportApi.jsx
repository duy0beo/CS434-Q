import api from "./api";

const createTicket = (subject) => api.post("/support/tickets", { subject });
const listTickets  = () => api.get("/support/tickets");
const claimTicket  = (id) => api.patch(`/support/tickets/${id}/claim`);
const closeTicket  = (id) => api.patch(`/support/tickets/${id}/close`);
const listMessages = (id) => api.get(`/support/tickets/${id}/messages`);
const sendMessage  = (id, content) => api.post(`/support/tickets/${id}/messages`, { content });

// Gán tất cả các hàm vào một object có tên là "supportApi"
const supportApi = {
    createTicket,
    listTickets,
    claimTicket,
    closeTicket,
    listMessages,
    sendMessage
};

// Xuất khẩu object đã được đặt tên
export default supportApi;