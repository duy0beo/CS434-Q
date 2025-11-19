import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header'; 
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../services/api';

const MainLayout = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Logic lấy thông tin user được đặt ở đây, là nguồn dữ liệu duy nhất
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await api.get('/users/me');
                    setUser(res.data);
                } catch (error) {
                    console.error("Token không hợp lệ, đang đăng xuất.", error);
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                }
            }
            setIsLoading(false);
        };
        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setUser(null);
        navigate('/login');
    };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#fff' }}>
      {/* Truyền user, isLoading, và hàm logout xuống Header */}
      <Header user={user} isLoading={isLoading} onLogout={handleLogout} />
      
      {/* Truyền user xuống Navbar để nó quyết định hiển thị menu nào */}
      <Navbar user={user} />

      <main style={{ flexGrow: 1 }}>
        {/* Outlet là nơi nội dung của các trang con (như Home.jsx) được render */}
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;