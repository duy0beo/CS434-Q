import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaUserCog, FaHotel, FaBook, FaChevronDown, FaSignOutAlt, FaUsers, FaUserShield, } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminLayout = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isHotelMenuOpen, setHotelMenuOpen] = useState(false);
    const navigate = useNavigate();

    const activeClassName = "bg-blue-600 text-white";
    const inactiveClassName = "text-gray-300 hover:bg-gray-700 hover:text-white";
    const navLinkClass = `flex items-center gap-3 py-2 px-4 rounded transition-colors`;
    const dropdownButtonClass = "w-full flex justify-between items-center text-gray-300 hover:bg-gray-700 hover:text-white py-2 px-4 rounded transition-colors";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        toast.success("Đăng xuất thành công!");
        navigate("/login");
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 flex flex-col justify-between">
                <div>
                    <div className="p-4 border-b border-gray-700">
                        <h1 className="text-2xl font-bold text-white text-center">Admin Panel</h1>
                    </div>
                    <nav className="flex-grow p-4">
                        <ul className="space-y-2">

                            {/* Menu Quản lý người dùng */}
                            <li>
                                <button 
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={dropdownButtonClass}
                                >
                                    <span className="flex items-center gap-3">
                                        <FaUserCog /> Quản lý người dùng
                                    </span>
                                    <FaChevronDown className={`transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isUserMenuOpen && (
                                    <ul className="pt-2 pl-4 space-y-2">
                                        <li>
                                            <NavLink to="/admin/customers" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClassName : inactiveClassName}`}>
                                                <FaUsers className="ml-1" /> Khách hàng
                                            </NavLink>
                                        </li>

                                        <li>
                                            <NavLink to="/admin/employees" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClassName : inactiveClassName}`}>
                                                <FaUserShield className="ml-1" /> Nhân viên
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            {/* Menu Quản lý Khách sạn */}
                            <li>
                                <button 
                                    onClick={() => setHotelMenuOpen(!isHotelMenuOpen)}
                                    className={dropdownButtonClass}
                                >
                                    <span className="flex items-center gap-3">
                                        <FaHotel /> Quản lý khách sạn
                                    </span>
                                    <FaChevronDown className={`transition-transform duration-300 ${isHotelMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isHotelMenuOpen && (
                                    <ul className="pt-2 pl-4 space-y-2">
                                        <li>
                                            <NavLink to="/admin/rooms" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClassName : inactiveClassName}`}>
                                                Danh sách phòng
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/admin/room-types" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClassName : inactiveClassName}`}>
                                                Loại phòng
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            
                            <li>
                                <NavLink to="/admin/bookings" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClassName : inactiveClassName}`}>
                                    <FaBook /> Quản lý Đặt phòng
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Nút Đăng xuất ở dưới cùng */}
                <div className="p-4 border-t border-gray-700">
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-3 py-2 px-4 rounded text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                    >
                        <FaSignOutAlt /> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;