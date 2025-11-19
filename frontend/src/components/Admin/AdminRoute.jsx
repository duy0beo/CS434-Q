import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import hook useAuth

const AdminRoute = () => {
    // Lấy thông tin từ Context, không đọc trực tiếp từ localStorage nữa
    const { isAuthenticated, user, loading } = useAuth();

    // Trong khi context đang xác thực, hiển thị trạng thái chờ
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Đang kiểm tra quyền truy cập...</div>;
    }

    // Nếu đã xác thực xong và người dùng không đăng nhập
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Nếu đã đăng nhập, kiểm tra vai trò
    // **SỬA Ở ĐÂY**: Cho phép cả admin và employee
    if (user && (user.role === 'admin' || user.role === 'employee')) {
        return <Outlet />; // Cho phép truy cập
    }

    // Nếu vai trò không hợp lệ, chuyển hướng về trang chủ
    return <Navigate to="/" replace />;
};

export default AdminRoute;