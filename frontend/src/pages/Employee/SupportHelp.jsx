import React from "react";
import toast from "react-hot-toast";
import supportApi from "../../services/supportApi";

const { createTicket, listMessages, sendMessage, closeTicket } = supportApi;

export default function SupportHelp() {
    const [subject, setSubject] = React.useState("");
    const [ticket, setTicket] = React.useState(null);
    const [messages, setMessages] = React.useState([]);
    const [input, setInput] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const startSupport = async (e) => {
        e.preventDefault();
        if (!subject.trim()) {
            toast.error("Vui lòng nhập nội dung cần hỗ trợ.");
            return;
        }
        setLoading(true);
        try {
            const { data } = await createTicket(subject.trim());
            setTicket(data);
            const msgs = await listMessages(data.id);
            setMessages(msgs.data || []);
            toast.success("Đã tạo yêu cầu hỗ trợ. Vui lòng chờ nhân viên nhận.");
        } catch {
            toast.error("Không tạo được yêu cầu. Thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const sendMsg = async (e) => {
        e.preventDefault();
        if (!ticket || !input.trim()) return;
        try {
            const { data } = await sendMessage(ticket.id, input.trim());
            setMessages((prev) => [...prev, data]);
            setInput("");
        } catch {
            toast.error("Gửi tin nhắn thất bại.");
        }
    };

    const endSupport = async () => {
        if (!ticket) return;
        try {
            await closeTicket(ticket.id);
            toast.success("Đã kết thúc phiên hỗ trợ.");
            setTicket(null);
            setMessages([]);
            setSubject("");
        } catch {
            toast.error("Không thể kết thúc phiên.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
            {!ticket ? (
                <form onSubmit={startSupport} className="space-y-4">
                    <h2 className="text-xl font-bold">Liên hệ hỗ trợ</h2>
                    <input
                        className="w-full border rounded px-3 py-2"
                        placeholder="Mô tả ngắn vấn đề…"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                    <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                        {loading ? "Đang tạo…" : "Bắt đầu hỗ trợ"}
                    </button>
                </form>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Phiên hỗ trợ: {ticket.subject}</h3>
                        <button onClick={endSupport} className="text-sm px-3 py-1 bg-red-600 text-white rounded">Kết thúc</button>
                    </div>
                    <div className="h-72 overflow-y-auto border rounded p-3 space-y-2">
                        {messages.map((m) => (
                            <div key={m.id} className="text-sm">
                                <span className="font-semibold">{m.sender?.first_name || m.senderId}</span>: {m.content}
                            </div>
                        ))}
                        {messages.length === 0 && <div className="text-gray-500 text-sm">Chưa có tin nhắn.</div>}
                    </div>
                    <form onSubmit={sendMsg} className="mt-3 flex gap-2">
                        <input
                            className="flex-1 border rounded px-3 py-2"
                            placeholder="Nhập tin nhắn…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button className="px-4 py-2 bg-blue-600 text-white rounded">Gửi</button>
                    </form>
                </div>
            )}
        </div>
    );
}
