// file: frontend/src/pages/BookingResultPage.jsx

import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom'; // ✅ 1. Import useNavigate
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BookingResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate(); // ✅ 2. Khởi tạo navigate
    const [status, setStatus] = useState('pending');
    const [message, setMessage] = useState('Đang xác thực giao dịch của bạn...');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const responseCode = params.get('vnp_ResponseCode');

        if (responseCode === '00') {
            setStatus('success');
            setMessage('Đơn đặt phòng của bạn đã được xác nhận thành công!');
            toast.success('Thanh toán thành công!');
        } else {
            setStatus('error');
            setMessage('Giao dịch thanh toán đã thất bại. Vui lòng thử lại.');
            toast.error('Thanh toán thất bại!');
        }
    }, [location]);

    // ✅ 3. Thêm useEffect để tự động chuyển trang
    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                navigate('/my-account'); // Chuyển về trang tài khoản
            }, 3000); // Sau 3 giây

            // Dọn dẹp timer khi component unmount
            return () => clearTimeout(timer);
        }
    }, [status, navigate]);

    return (
        <div className="container mx-auto text-center py-20 px-4">
            {status === 'pending' && (
                <>
                    <FaSpinner className="text-6xl text-gray-400 mx-auto mb-4 animate-spin" />
                    <h1 className="text-3xl font-bold text-gray-800">Đang xử lý</h1>
                </>
            )}
            {status === 'success' && (
                <>
                    <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800">Thành công!</h1>
                </>
            )}
            {status === 'error' && (
                <>
                    <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800">Thất bại!</h1>
                </>
            )}

            <p className="text-gray-600 mt-4 max-w-md mx-auto">{message}</p>
            
            {/* ✅ 4. Thêm thông báo và nút bấm linh hoạt */}
            {status === 'success' && (
                <p className="text-sm text-gray-500 mt-4">
                    Bạn sẽ được tự động chuyển về trang quản lý sau 3 giây...
                </p>
            )}
            
            {status !== 'success' && (
                 <Link to="/my-account" className="mt-8 inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
                    Về trang tài khoản
                </Link>
            )}
        </div>
    );
};

export default BookingResultPage;