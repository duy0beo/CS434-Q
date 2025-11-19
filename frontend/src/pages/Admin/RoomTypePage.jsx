import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from 'react-hot-toast';

const RoomTypePage = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    
    // State để lưu file ảnh người dùng chọn
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/room-types");
            setRoomTypes(res.data);
        } catch (err) {
            toast.error("Không thể tải dữ liệu loại phòng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // Hàm xử lý khi người dùng chọn file
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file)); // Tạo URL tạm để xem trước ảnh
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({});
        setIsFormVisible(false);
        setSelectedFile(null);
        setPreviewImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        if (selectedFile) {
            formData.append('photo', selectedFile);
        }

        const promise = editingId 
            ? api.put(`/room-types/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            : api.post("/room-types", formData, { headers: { 'Content-Type': 'multipart/form-data' } });

        toast.promise(promise, {
            loading: 'Đang xử lý...',
            success: () => { fetchData(); resetForm(); return editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!'; },
            error: editingId ? 'Cập nhật thất bại!' : 'Thêm mới thất bại!',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa loại phòng này?")) return;
        
        const promise = api.delete(`/room-types/${id}`);
        toast.promise(promise, {
            loading: 'Đang xóa...',
            success: () => { fetchData(); return 'Xóa thành công!'; },
            error: 'Xóa thất bại!',
        });
    };

    const handleEditClick = (type) => {
        setEditingId(type.id);
        setForm({ name: type.name, description: type.description || "", basePrice: type.basePrice, maxOccupancy: type.maxOccupancy });
        setPreviewImage(type.photoUrl ? `http://localhost:5000${type.photoUrl}` : null);
        setSelectedFile(null);
        setIsFormVisible(true);
    };
    
    if (loading) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-700">Quản lý Loại phòng</h1>
                {!isFormVisible && ( <button onClick={() => { resetForm(); setIsFormVisible(true); }} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"> + Thêm loại phòng </button> )}
            </div>

            {isFormVisible && (
                <div className="mb-6 p-4 border rounded bg-gray-50 animate-fade-in">
                    <h3 className="font-semibold mb-3">{editingId ? "Chỉnh sửa Loại phòng" : "Thêm loại phòng mới"}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <input name="name" value={form.name || ''} onChange={handleChange} placeholder="Tên loại phòng" className="border p-2 rounded" required />
                            <input name="basePrice" value={form.basePrice || ''} onChange={handleChange} placeholder="Giá gốc" type="number" className="border p-2 rounded" required />
                            <input name="maxOccupancy" value={form.maxOccupancy || ''} onChange={handleChange} placeholder="Số người tối đa" type="number" className="border p-2 rounded" required />
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh Phòng</label>
                                <input 
                                    type="file" 
                                    name="photo" 
                                    onChange={handleFileChange} 
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        </div>

                        {previewImage && <img src={previewImage} alt="Xem trước" className="mt-4 w-48 h-32 object-cover rounded"/>}

                        <textarea name="description" value={form.description || ''} onChange={handleChange} placeholder="Mô tả" className="border p-2 rounded w-full mt-4" />
                        <div className="mt-4">
                            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded mr-2"> {editingId ? "Lưu thay đổi" : "Tạo loại phòng"} </button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-400 text-white rounded">Hủy</button>
                        </div>
                    </form>
                </div>
            )}
            
            <table className="min-w-full border rounded-lg shadow-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2">Tên loại phòng</th>
                        <th className="border px-4 py-2">Giá gốc</th>
                        <th className="border px-4 py-2">Số người</th>
                        <th className="border px-4 py-2">Ảnh</th>
                        <th className="border px-4 py-2">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {roomTypes.map((type) => (
                        <tr key={type.id} className="hover:bg-gray-50 text-center">
                            <td className="border px-4 py-2 font-medium">{type.name}</td>
                            <td className="border px-4 py-2">{Number(type.basePrice).toLocaleString()} ₫</td>
                            <td className="border px-4 py-2">{type.maxOccupancy}</td>
                            <td className="border px-4 py-2 flex justify-center">
                                <img src={type.photoUrl ? `http://localhost:5000${type.photoUrl}` : 'https://via.placeholder.com/100'} alt={type.name} className="w-24 h-16 object-cover rounded" />
                            </td>
                            <td className="border px-4 py-2">
                                <button onClick={() => handleEditClick(type)} className="text-blue-500 hover:underline mr-4">Sửa</button>
                                <button onClick={() => handleDelete(type.id)} className="text-red-500 hover:underline">Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoomTypePage;