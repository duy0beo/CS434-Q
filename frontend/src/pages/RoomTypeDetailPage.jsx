import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaUserFriends, FaCheckCircle, FaArrowLeft, FaUserCircle } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';

const RoomTypeDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [roomType, setRoomType] = useState(null);
     const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        const fetchRoomType = async () => {
            setLoading(true);
            try {
                // Gọi cả 2 API cùng lúc để tăng tốc độ
                const [roomTypeRes, reviewsRes] = await Promise.all([
                    api.get(`/room-types/${id}`),
                    api.get(`/room-types/${id}/reviews`)
                ]);
                setRoomType(roomTypeRes.data);
                setReviews(reviewsRes.data);
            } catch (error) {
                toast.error("Không thể tải thông tin phòng.");
            } finally {
                setLoading(false);
            }
        };
        fetchRoomType();
    }, [id]);

    const handleBookingClick = () => {
        if (isAuthenticated) {
            setIsBookingModalOpen(true);
        } else {
            toast.error("Vui lòng đăng nhập để đặt phòng.");
            navigate('/login');
        }
    };

    if (loading) return <div className="text-center p-20 animate-pulse">Đang tải thông tin phòng...</div>;
    if (!roomType) return <div className="text-center p-20">Không tìm thấy thông tin phòng.</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                {/* Nút Quay Lại */}
                <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 group">
                    <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
                    <span>Quay lại Trang chủ</span>
                </Link>

                <div className="bg-white p-8 rounded-2xl shadow-xl grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Cột hình ảnh */}
                    <div className="lg:col-span-3">
                        <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg group">
                            <img 
                                src={roomType.photoUrl ? `http://localhost:5000${roomType.photoUrl}` : 'https://via.placeholder.com/800x600'} 
                                alt={roomType.name} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                        </div>
                    </div>

                    {/* Cột thông tin */}
                    <div className="lg:col-span-2 flex flex-col">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">{roomType.name}</h1>
                        <p className="text-2xl font-semibold text-blue-600 mb-6 pb-6 border-b">
                            {new Intl.NumberFormat('vi-VN').format(roomType.basePrice)} VNĐ/đêm
                        </p>
                        
                        <div className="text-gray-600 mb-6 space-y-4">
                            <p className="leading-relaxed">{roomType.description}</p>
                        </div>

                        {/* Tiện ích nổi bật */}
                        <div className="mb-8 space-y-3">
                            <div className="flex items-center gap-3">
                                <FaUserFriends className="text-blue-500 text-xl"/>
                                <span className="text-gray-700">Sức chứa tối đa: <strong>{roomType.maxOccupancy} người</strong></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaCheckCircle className="text-green-500 text-xl"/>
                                <span className="text-gray-700">Wi-Fi miễn phí & TV thông minh</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaCheckCircle className="text-green-500 text-xl"/>
                                <span className="text-gray-700">Điều hòa & Nước nóng</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleBookingClick}
                            className="w-full mt-auto bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            Đặt phòng ngay
                        </button>
                    </div>

                    {/* HIỂN THỊ ĐÁNH GIÁ */}
                    <div className="mt-12 bg-white p-8 rounded-2xl shadow-xl">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Đánh giá từ khách hàng</h2>
                        {reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map(review => (
                                    <div key={review.id} className="border-b pb-6">
                                        <div className="flex items-center mb-2">
                                            <FaUserCircle className="text-gray-400 text-2xl mr-3" />
                                            <div className="flex-grow">
                                                <p className="font-semibold text-gray-800">
                                                    {`${review.booking?.customer?.user?.first_name || ''} ${review.booking?.customer?.user?.last_name || ''}`.trim() || 'Ẩn danh'}
                                                </p>
                                                <StarRating rating={review.rating} />
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 ml-9">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Chưa có đánh giá nào cho loại phòng này.</p>
                        )}
                    </div>
                </div>
            </div>

            {isBookingModalOpen && (
                <BookingModal 
                    roomType={roomType} 
                    user={user}
                    onClose={() => setIsBookingModalOpen(false)} 
                    onSuccess={(msg) => {
                        toast.success(msg);
                        setIsBookingModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default RoomTypeDetailPage;