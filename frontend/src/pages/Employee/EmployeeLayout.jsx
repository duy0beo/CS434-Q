import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaHandsHelping, FaSuitcase, FaHotel, FaTools, FaUserCircle, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function EmployeeLayout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [openSupport, setOpenSupport] = React.useState(false);    // mở sẵn Hỗ trợ
    const [openRooms, setOpenRooms] = React.useState(false);        // mở sẵn Phòng

    const activeClass = "bg-blue-600 text-white";
    const inactiveClass = "text-gray-300 hover:bg-gray-700 hover:text-white";
    const itemClass = "flex items-center gap-3 py-2 px-4 rounded transition-colors";
    const dropBtn = "w-full flex justify-between items-center text-gray-300 hover:bg-gray-700 hover:text-white py-2 px-4 rounded transition-colors";

    const handleLogout = () => {
        logout?.();
        toast.success("Đăng xuất thành công!");
        navigate("/login");
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 flex flex-col justify-between">
                <div>
                    <div className="p-4 border-b border-gray-700">
                        <h1 className="text-2xl font-bold text-white text-center">Employee Panel</h1>
                        <p className="text-xs text-gray-400 text-center mt-1 truncate">{user?.email}</p>
                    </div>

                    <nav className="flex-grow p-4">
                        <ul className="space-y-2">
                            {/* Tổng quan */}
                            <li>
                                <NavLink end to="/employee" className={({ isActive }) => `${itemClass} ${isActive ? activeClass : inactiveClass}`}>
                                    <FaTachometerAlt /> Tổng quan
                                </NavLink>
                            </li>

                            {/* Hỗ trợ khách hàng */}
                            <li>
                                <button onClick={() => setOpenSupport(v => !v)} className={dropBtn}>
                                    <span className="flex items-center gap-3"><FaHandsHelping /> Hỗ trợ khách hàng</span>
                                    <FaChevronDown className={`transition-transform duration-300 ${openSupport ? "rotate-180" : ""}`} />
                                </button>
                                {openSupport && (
                                    <ul className="pt-2 pl-4 space-y-2">
                                        <li>
                                            <NavLink to="/employee/support/queue" className={({ isActive }) => `${itemClass} ${isActive ? activeClass : inactiveClass}`}>
                                                Hàng chờ hỗ trợ
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/employee/support/history" className={({ isActive }) => `${itemClass} ${isActive ? activeClass : inactiveClass}`}>
                                                Lịch sử phiên hỗ trợ
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            {/* Đặt phòng */}
                            <li>
                                <NavLink to="/employee/bookings" className={({ isActive }) => `${itemClass} ${isActive ? activeClass : inactiveClass}`}>
                                    <FaSuitcase /> Quản lý đặt phòng
                                </NavLink>
                            </li>

                            {/* Phòng & Bảo trì */}
                            <li>
                                <button onClick={() => setOpenRooms(v => !v)} className={dropBtn}>
                                    <span className="flex items-center gap-3"><FaHotel /> Phòng & Bảo trì</span>
                                    <FaChevronDown className={`transition-transform duration-300 ${openRooms ? "rotate-180" : ""}`} />
                                </button>
                                {openRooms && (
                                    <ul className="pt-2 pl-4 space-y-2">
                                        <li>
                                            <NavLink to="/employee/rooms" className={({ isActive }) => `${itemClass} ${isActive ? activeClass : inactiveClass}`}>
                                                Bảng trạng thái phòng
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/employee/maintenance" className={({ isActive }) => `${itemClass} ${isActive ? activeClass : inactiveClass}`}>
                                                Ticket bảo trì
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            {/* Hồ sơ */}
                            <li>
                                <NavLink to="/employee/profile" className={({ isActive }) => `${itemClass} ${isActive ? activeClass : inactiveClass}`}>
                                    <FaUserCircle /> Hồ sơ cá nhân
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-gray-700">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 py-2 px-4 rounded text-red-400 hover:bg-red-600 hover:text-white transition-colors">
                        <FaSignOutAlt /> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
