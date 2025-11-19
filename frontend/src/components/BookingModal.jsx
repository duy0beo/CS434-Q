import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUsers, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../services/api';

const BookingModal = ({ roomType, onClose, onSuccess }) => {
    // Hàm này để xác định ngày check-in sớm nhất có thể
    const getMinCheckInDate = () => {
        const today = new Date();
        // Nếu đã qua 14h, ngày có thể đặt sớm nhất là ngày mai
        if (today.getHours() >= 14) {
            today.setDate(today.getDate() + 1);
        }
        return today.toISOString().split('T')[0]; // Format sang "YYYY-MM-DD"
    };

    // State lưu ngày check-in tối thiểu
    const minCheckIn = getMinCheckInDate();
    
    // Các state khác của component
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [totalGuests, setTotalGuests] = useState(1);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [nights, setNights] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    // Tự động tính lại giá tiền khi ngày thay đổi
    useEffect(() => {
        if (checkInDate && checkOutDate) {
            const start = new Date(checkInDate);
            const end = new Date(checkOutDate);

            if (end > start) {
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setNights(diffDays);
                setTotalPrice(diffDays * roomType.basePrice);
            } else {
                setNights(0);
                setTotalPrice(0);
            }
        } else {
            setNights(0);
            setTotalPrice(0);
        }
    }, [checkInDate, checkOutDate, roomType.basePrice]);

    // Hàm xác định ngày check-out tối thiểu (luôn sau ngày check-in)
    const getMinCheckOutDate = () => {
        if (!checkInDate) return minCheckIn;
        const nextDay = new Date(checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay.toISOString().split('T')[0];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (nights <= 0) {
            setError('Ngày trả phòng phải sau ngày nhận phòng.');
            return;
        }
        setIsLoading(true);

        const bookingData = {
            roomTypeId: roomType.id,
            checkInDate,
            checkOutDate,
            totalGuests,
        };

        try {
            // Bước 1: Tạo đơn hàng với trạng thái "Pending"
            const bookingResponse = await api.post('/bookings', bookingData);
            const { booking } = bookingResponse.data;

            if (!booking || !booking.id) {
                throw new Error("Không thể tạo đơn đặt phòng.");
            }

            // Bước 2: Dùng booking.id để tạo URL thanh toán
            const paymentResponse = await api.post('/payment/create-payment-url', {
                bookingId: booking.id
            });
            const { paymentUrl } = paymentResponse.data;

            // Bước 3: Chuyển hướng người dùng đến cổng thanh toán
            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                 throw new Error("Không thể lấy địa chỉ thanh toán.");
            }
            
            // Các hàm onSuccess, onClose không còn cần thiết ở đây nữa vì trang sẽ được chuyển hướng
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            setError(errorMsg);
            setIsLoading(false); // Dừng loading nếu có lỗi
        }
        // Không cần khối finally nữa
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative animate-fade-in-up">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{roomType.name}</h2>
                        <p className="text-gray-500">Hoàn tất thông tin để tiến hành thanh toán</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Ngày nhận phòng" icon={<FaCalendarAlt />}>
                            <input type="date" value={checkInDate} min={minCheckIn} onChange={(e) => setCheckInDate(e.target.value)} required />
                        </InputField>
                        <InputField label="Ngày trả phòng" icon={<FaCalendarAlt />}>
                            <input type="date" value={checkOutDate} min={getMinCheckOutDate()} onChange={(e) => setCheckOutDate(e.target.value)} disabled={!checkInDate} required />
                        </InputField>
                    </div>
                    
                    <InputField label={`Số lượng khách (Tối đa: ${roomType.maxOccupancy})`} icon={<FaUsers />}>
                        <input type="number" value={totalGuests} onChange={(e) => setTotalGuests(e.target.value)} min="1" max={roomType.maxOccupancy} required />
                    </InputField>

                    {nights > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-gray-600">
                                {new Intl.NumberFormat('vi-VN').format(roomType.basePrice)} VNĐ/đêm x {nights} đêm
                            </p>
                            <p className="text-xl font-bold text-gray-800 mt-1">
                                Tổng cộng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                            </p>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

                    <div className="pt-4">
                        <button 
                            type="submit"
                            disabled={isLoading || nights <= 0}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <FaSpinner className="animate-spin" /> : 'Tiến hành Thanh toán'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, icon, children }) => (
    <div>
        <label className="text-sm font-medium text-gray-600 block mb-2">{label}</label>
        <div className="relative flex items-center">
            <span className="absolute left-3 text-gray-400">{icon}</span>
            <div className="w-full">
                 {React.Children.map(children, child => 
                    React.cloneElement(child, {
                        className: "w-full border-gray-300 rounded-md shadow-sm pl-10 pr-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    })
                )}
            </div>
        </div>
    </div>
);

export default BookingModal;