import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/admin/users');
                setUsers(res.data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách user:", error);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Quản lý Người dùng</h1>
            {/* Bạn có thể hiển thị danh sách user trong một bảng ở đây */}
            <pre className="bg-white p-4 rounded shadow">{JSON.stringify(users, null, 2)}</pre>
        </div>
    );
};

export default UserManagement;