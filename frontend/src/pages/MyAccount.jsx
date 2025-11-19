import React, { useState, useEffect, useCallback } from 'react';
import { FaUserCircle, FaSuitcase, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Import các component con
import ProfileSection from '../components/MyAccount/ProfileSection';
import BookingSection from '../components/MyAccount/BookingSection';
import SecuritySection from '../components/MyAccount/SecuritySection';

const MyAccount = () => {
    // ✅ THAY ĐỔI Ở ĐÂY: Đặt 'profile' làm tab mặc định
    const [activeTab, setActiveTab] = useState('profile'); 
    
    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const [profileRes, bookingsRes] = await Promise.all([
                api.get('/users/me'),
                api.get('/bookings/my')
            ]);
            
            setProfile(profileRes.data);
            setBookings(bookingsRes.data);
        } catch (err) {
            console.error("Failed to fetch account data:", err);
            setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }, []); 

    useEffect(() => {
        fetchData();
    }, [fetchData]); 

    if (isLoading) {
        return <div className="text-center p-20">Đang tải dữ liệu tài khoản...</div>;
    }

    if (error) {
        return <div className="text-center p-20 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto my-8 p-4 font-sans text-gray-800">
            <Link to="/" className='inline-flex items-center text-blue-600 hover:text-blue-800 mb-6'>
                <FaArrowLeft className='mr-2'/>
                Trở về Trang chủ
            </Link>

            <h1 className="text-4xl font-bold mb-8 pb-4 border-b border-gray-200">
                Tài khoản của tôi
            </h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar điều hướng */}
                <nav className="md:w-1/4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <ul className="space-y-2">
                            <NavItem 
                                icon={<FaUserCircle />} 
                                label="Hồ sơ cá nhân" 
                                isActive={activeTab === 'profile'} 
                                onClick={() => setActiveTab('profile')} 
                            />
                            <NavItem 
                                icon={<FaSuitcase />} 
                                label="Đơn đặt phòng" 
                                isActive={activeTab === 'bookings'} 
                                onClick={() => setActiveTab('bookings')} 
                            />
                            <NavItem 
                                icon={<FaShieldAlt />} 
                                label="Bảo mật" 
                                isActive={activeTab === 'security'} 
                                onClick={() => setActiveTab('security')} 
                            />
                        </ul>
                    </div>
                </nav>

                {/* Main content hiển thị component tương ứng */}
                <main className="flex-1">
                    {activeTab === 'profile' && profile && (
                        <ProfileSection 
                            initialProfile={profile} 
                            onProfileUpdate={(updatedProfile) => setProfile(updatedProfile)} 
                        />
                    )}
                    {activeTab === 'bookings' && (
                        <BookingSection 
                            bookings={bookings} 
                            onBookingUpdate={fetchData}
                        />
                    )}
                    {activeTab === 'security' && <SecuritySection />}
                </main>
            </div>
        </div>
    );
};

// Component con cho các mục trong sidebar
const NavItem = ({ icon, label, isActive, onClick }) => (
    <li>
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-all duration-300 ease-in-out
                ${isActive 
                    ? 'bg-blue-600 text-white font-bold shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
            }
        >
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
        </button>
    </li>
);

export default MyAccount;