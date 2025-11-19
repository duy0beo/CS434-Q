import React from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function EmpSupportHistory() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Gợi ý API: trả về những ticket đã đóng / hoàn tất của chính nhân viên
        // Bạn có thể đổi query tùy backend: status=closed|completed, scope=mine, ...
        const { data } = await api.get("/support/tickets?status=closed&scope=mine");
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error("Không tải được lịch sử phiên hỗ trợ.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Lịch sử phiên hỗ trợ</h2>

      {loading ? (
        <div className="text-gray-600">Đang tải…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500">Chưa có phiên đã kết thúc.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Mã</th>
                <th className="px-4 py-2 text-left">Khách hàng</th>
                <th className="px-4 py-2 text-left">Chủ đề</th>
                <th className="px-4 py-2 text-left">Bắt đầu</th>
                <th className="px-4 py-2 text-left">Kết thúc</th>
                <th className="px-4 py-2 text-left">Trạng thái</th>
                <th className="px-4 py-2 text-left">Xem</th>
              </tr>
            </thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-2">{t.id}</td>
                  <td className="px-4 py-2">{t.requester?.email || t.requesterId}</td>
                  <td className="px-4 py-2">{t.subject}</td>
                  <td className="px-4 py-2">{t.createdAt ? new Date(t.createdAt).toLocaleString("vi-VN") : "-"}</td>
                  <td className="px-4 py-2">{t.closedAt ? new Date(t.closedAt).toLocaleString("vi-VN") : "-"}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                      {t.status || "closed"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Link className="text-blue-600 hover:underline" to={`/employee/support/chat/${t.id}`}>
                      Mở transcript
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
