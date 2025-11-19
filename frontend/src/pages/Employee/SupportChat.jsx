import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import supportApi from "../../services/supportApi";

const { listMessages, sendMessage, closeTicket } = supportApi;

export default function SupportChat() {
    const { id } = useParams();
    const [messages, setMessages] = React.useState([]);
    const [input, setInput] = React.useState("");
    const navigate = useNavigate();

    const load = async () => {
        try {
            const { data } = await listMessages(id);
            setMessages(data);
        } catch {
            toast.error("Không tải được tin nhắn");
        }
    };

    React.useEffect(() => { load(); }, [id]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        try {
            const { data } = await sendMessage(id, input.trim());
            setMessages((p) => [...p, data]);
            setInput("");
        } catch {
            toast.error("Gửi thất bại");
        }
    };

    const handleEnd = async () => {
        try {
            await closeTicket(id);
            toast.success("Đã kết thúc phiên");
            navigate("/employee/support/queue");
        } catch {
            toast.error("Không thể kết thúc phiên");
        }
    };

    return (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold">Phòng hỗ trợ #{String(id).slice(0, 6)}</h2>
                <button onClick={handleEnd} className="px-3 py-1 bg-red-600 text-white rounded">Kết thúc</button>
            </div>
            <div className="h-72 overflow-y-auto border rounded p-3 space-y-2">
                {messages.map((m) => (
                    <div key={m.id} className="text-sm">
                        <span className="font-semibold">{m.sender?.first_name || m.senderId}</span>: {m.content}
                    </div>
                ))}
                {messages.length === 0 && <div className="text-gray-500 text-sm">Chưa có tin nhắn.</div>}
            </div>
            <form onSubmit={handleSend} className="mt-3 flex gap-2">
                <input className="flex-1 border rounded px-3 py-2" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập tin nhắn..." />
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Gửi</button>
            </form>
        </div>
    );
}
