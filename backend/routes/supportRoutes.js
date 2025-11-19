import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import SupportTicket from "../models/SupportTicket.js";
import SupportMessage from "../models/SupportMessage.js";
import User from "../models/User.js";

const router = Router();

// customer tạo ticket
router.post("/tickets", verifyToken, async (req, res) => {
    try {
        const { subject } = req.body;
        if (!subject) return res.status(400).json({ message: "Subject is required" });
        const t = await SupportTicket.create({ subject, customerId: req.user.id, status: "Waiting" });
        return res.json(t);
    } catch (e) { return res.status(500).json({ message: "Server error" }); }
});

// employee xem hàng chờ
router.get("/tickets", verifyToken, async (req, res) => {
    try {
        // nhân viên chỉ cần thấy Waiting hoặc Assigned cho chính mình
        const where = req.user.role === "employee" || req.user.role === "admin"
            ? {}
            : { customerId: req.user.id };
        const tickets = await SupportTicket.findAll({
            where,
            include: [
                { model: User, as: "customer", attributes: ["id","email","first_name","last_name"] },
                { model: User, as: "assignee", attributes: ["id","email","first_name","last_name"] },
            ],
            order: [["created_at","DESC"]],
        });
        return res.json(tickets);
    } catch { return res.status(500).json({ message: "Server error" }); }
});

// employee nhận ticket
router.patch("/tickets/:id/claim", verifyToken, async (req, res) => {
    try {
        if (req.user.role !== "employee" && req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }
        const t = await SupportTicket.findByPk(req.params.id);
        if (!t) return res.status(404).json({ message: "Not found" });
        if (t.status !== "Waiting" && t.assignedTo && t.assignedTo !== req.user.id) {
            return res.status(409).json({ message: "Ticket already taken" });
        }
        t.assignedTo = req.user.id;
        t.status = "Active";
        await t.save();
        return res.json(t);
    } catch { return res.status(500).json({ message: "Server error" }); }
});

// đóng ticket (customer hoặc employee đều có thể kết thúc phiên)
router.patch("/tickets/:id/close", verifyToken, async (req, res) => {
    try {
        const t = await SupportTicket.findByPk(req.params.id);
        if (!t) return res.status(404).json({ message: "Not found" });
        // quyền: chủ ticket, assignee, admin
        if (t.customerId !== req.user.id && t.assignedTo !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }
        t.status = "Closed";
        await t.save();
        return res.json(t);
    } catch { return res.status(500).json({ message: "Server error" }); }
});

// list messages
router.get("/tickets/:id/messages", verifyToken, async (req, res) => {
    try {
        const t = await SupportTicket.findByPk(req.params.id);
        if (!t) return res.status(404).json({ message: "Not found" });
        if (t.customerId !== req.user.id && t.assignedTo !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }
        const msgs = await SupportMessage.findAll({
            where: { ticketId: t.id },
            include: [{ model: User, as: "sender", attributes: ["id","email","first_name","last_name"] }],
            order: [["created_at","ASC"]],
        });
        return res.json(msgs);
    } catch { return res.status(500).json({ message: "Server error" }); }
});

// send message (Socket sẽ phát realtime, REST để lưu)
router.post("/tickets/:id/messages", verifyToken, async (req, res) => {
    try {
        const t = await SupportTicket.findByPk(req.params.id);
        if (!t) return res.status(404).json({ message: "Not found" });
        if (t.customerId !== req.user.id && t.assignedTo !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }
        const { content } = req.body;
        if (!content?.trim()) return res.status(400).json({ message: "Empty" });
        const m = await SupportMessage.create({ ticketId: t.id, senderId: req.user.id, content });
        // phát realtime
        req.io?.to(`ticket:${t.id}`).emit("support:message", {
            id: m.id,
            content: m.content,
            createdAt: m.createdAt,
            senderId: req.user.id,
        });
        return res.json(m);
    } catch { return res.status(500).json({ message: "Server error" }); }
});

export default router;
