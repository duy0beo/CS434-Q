import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import supportApi from "../../services/supportApi";

const { listTickets, claimTicket } = supportApi;

export default function SupportQueue() {
    const [tickets, setTickets] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await listTickets();
            const waiting = data.filter((t) => t.status === "Waiting");
            const mine = data.filter((t) => t.assignedTo);
            setTickets([...waiting, ...mine]);
        } catch {
            toast.error("Không tải được danh sách.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => { load(); }, []);

    const handleClaim = async (id) => {
        try {
            await claimTicket(id);
            toast.success("Đã nhận hỗ trợ");
            navigate(`/employee/support/chat/${id}`);
        } catch (e) {
            toast.error(e.response?.data?.message || "Không thể nhận ticket");
        }
    };

    if (loading) return <div className="p-6 bg-white rounded-xl shadow">Đang tải…</div>;

    return (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Hàng chờ hỗ trợ</h2>
            {tickets.length === 0 ? (
                <p className="text-gray-600">Chưa có yêu cầu.</p>
            ) : (
                <ul className="space-y-3">
                    {tickets.map((t) => (
                        <li key={t.id} className="border rounded p-3 flex items-center justify-between">
                            <div>
                                <div className="font-semibold">{t.subject}</div>
                                <div className="text-xs text-gray-500">Trạng thái: {t.status}</div>
                            </div>
                            {t.status === "Waiting" ? (
                                <button onClick={() => handleClaim(t.id)} className="px-3 py-1 bg-blue-600 text-white rounded">Nhận</button>
                            ) : (
                                <button onClick={() => navigate(`/employee/support/chat/${t.id}`)} className="px-3 py-1 bg-gray-200 rounded">Vào phòng</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
