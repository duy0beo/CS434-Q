// file: frontend/src/pages/BookingResultPage.jsx

import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BookingResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
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

    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                navigate('/my-account');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [status, navigate]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-20">

            {status === 'pending' && (
                <>
                    <FaSpinner className="text-7xl text-blue-500 mx-auto mb-4 animate-spin drop-shadow" />
                    <h1 className="text-4xl font-extrabold text-blue-700">Đang xử lý...</h1>
                </>
            )}

            {status === 'success' && (
                <>
                    <FaCheckCircle className="text-7xl text-green-500 mx-auto mb-4 drop-shadow" />
                    <h1 className="text-4xl font-extrabold text-green-600">Thanh toán thành công!</h1>
                </>
            )}

            {status === 'error' && (
                <>
                    <FaTimesCircle className="text-7xl text-red-600 mx-auto mb-4 drop-shadow" />
                    <h1 className="text-4xl font-extrabold text-red-600">Thanh toán thất bại!</h1>
                </>
            )}

            <p className="text-gray-700 mt-4 max-w-md mx-auto leading-relaxed font-medium">
                {message}
            </p>

            {status === 'success' && (
                <p className="text-sm text-gray-600 mt-4 italic">
                    Hệ thống sẽ tự động chuyển trang sau 3 giây...
                </p>
            )}

            {status !== 'success' && (
                <Link
                    to="/my-account"
                    className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    ⬅ Về Trang Tài Khoản
                </Link>
            )}
        </div>
    );
};

export default BookingResultPage;
