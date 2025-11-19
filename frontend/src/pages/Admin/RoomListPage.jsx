import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from 'react-hot-toast';

const RoomListPage = () => {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        roomNumber: "",
        floor: "",
        status: "Available",
        notes: "",
        roomTypeId: "",
    });
    const [editingId, setEditingId] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomsRes, roomTypesRes] = await Promise.all([
                api.get("/rooms"),
                api.get("/room-types"), // Lấy danh sách loại phòng cho dropdown
            ]);
            setRooms(roomsRes.data);
            setRoomTypes(roomTypesRes.data);
        } catch (err) {
            toast.error("Không thể tải dữ liệu.");
            console.error("Lỗi khi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const resetForm = () => {
        setEditingId(null);
        setForm({ roomNumber: "", floor: "", status: "Available", notes: "", roomTypeId: "" });
        setIsFormVisible(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.roomTypeId) return alert("Vui lòng chọn loại phòng!");

        const promise = editingId 
            ? api.put(`/rooms/${editingId}`, form)
            : api.post("/rooms", form);

        toast.promise(promise, {
            loading: 'Đang xử lý...',
            success: () => {
                fetchData();
                resetForm();
                return editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!';
            },
            error: (err) => err.response?.data?.message || (editingId ? 'Cập nhật thất bại!' : 'Thêm mới thất bại!'),
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa phòng này?")) return;

        const promise = api.delete(`/rooms/${id}`);
        toast.promise(promise, {
            loading: 'Đang xóa...',
            success: () => {
                fetchData();
                return 'Xóa thành công!';
            },
            error: 'Xóa thất bại!',
        });
    };
    
    const handleEditClick = (room) => {
        setEditingId(room.id);
        setForm({
            roomNumber: room.roomNumber,
            floor: room.floor,
            status: room.status,
            notes: room.notes || "",
            roomTypeId: room.roomTypeId || "",
        });
        setIsFormVisible(true);
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;
    
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-700">Danh sách Phòng</h1>
                {!isFormVisible && (
                    <button
                        onClick={() => {
                            resetForm();
                            setIsFormVisible(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        + Thêm phòng
                    </button>
                )}
            </div>

            {isFormVisible && (
                <div className="mb-6 p-4 border rounded bg-gray-50 animate-fade-in">
                    <h3 className="font-semibold mb-3">{editingId ? "Chỉnh sửa Phòng" : "Thêm phòng mới"}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <input name="roomNumber" value={form.roomNumber} onChange={handleChange} placeholder="Số phòng (ví dụ: 101)" className="border p-2 rounded" required />
                            <input name="floor" value={form.floor} onChange={handleChange} placeholder="Tầng" type="number" className="border p-2 rounded" required />
                            <select name="status" value={form.status} onChange={handleChange} className="border p-2 rounded bg-white">
                                <option value="Available">Trống</option>
                                <option value="Occupied">Có khách</option>
                                <option value="Maintenance">Bảo trì</option>
                            </select>
                            <select name="roomTypeId" value={form.roomTypeId} onChange={handleChange} className="border p-2 rounded bg-white" required>
                                <option value="" disabled>-- Chọn loại phòng --</option>
                                {roomTypes.map((type) => (<option key={type.id} value={type.id}>{type.name}</option>))}
                            </select>
                        </div>
                        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Ghi chú" className="border p-2 rounded w-full mt-4" />
                        <div className="mt-4">
                            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded mr-2">
                                {editingId ? "Lưu thay đổi" : "Tạo phòng"}
                            </button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-400 text-white rounded">Hủy</button>
                        </div>
                    </form>
                </div>
            )}

            <table className="min-w-full border rounded-lg shadow-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2">Số phòng</th>
                        <th className="border px-4 py-2">Loại phòng</th>
                        <th className="border px-4 py-2">Ảnh</th>
                        <th className="border px-4 py-2">Giá gốc</th>
                        <th className="border px-4 py-2">Tầng</th>
                        <th className="border px-4 py-2">Trạng thái</th>
                        <th className="border px-4 py-2">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-gray-50 text-center">
                            <td className="border px-4 py-2 font-medium">{room.roomNumber}</td>
                            <td className="border px-4 py-2">{room.roomType?.name || 'N/A'}</td>
                            <td className="border px-4 py-2 flex justify-center">
                                <img 
                                    src={room.roomType?.photoUrl || 'https://via.placeholder.com/100'} 
                                    alt={room.roomType?.name || 'Phòng'}
                                    className="w-24 h-16 object-cover rounded"
                                />
                            </td>
                            <td className="border px-4 py-2">
                                {room.roomType ? `${Number(room.roomType.basePrice).toLocaleString()} ₫` : 'N/A'}
                            </td>
                            <td className="border px-4 py-2">{room.floor}</td>
                            <td className="border px-4 py-2">{room.status}</td>
                            <td className="border px-4 py-2">
                                <button onClick={() => handleEditClick(room)} className="text-blue-500 hover:underline mr-4">Sửa</button>
                                <button onClick={() => handleDelete(room.id)} className="text-red-500 hover:underline">Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoomListPage;