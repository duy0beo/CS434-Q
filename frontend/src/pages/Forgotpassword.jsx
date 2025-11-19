import { useState } from "react";
import { Link } from "react-router-dom"; // ✅ Dùng Link thay cho <a>
import api from "../services/api"; // ✅ Dùng instance api đã cấu hình
import toast from 'react-hot-toast'; // ✅ Dùng toast để thông báo đẹp hơn
import { FaArrowLeft, FaSpinner } from "react-icons/fa";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isSuccess, setIsSuccess] = useState(false); // ✅ State để quản lý trạng thái thành công
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // ✅ API call đã được sửa lại cho đúng
            await api.post("/users/forgot-password", { email });
            setIsSuccess(true); // Chuyển sang trạng thái thành công
            toast.success("Yêu cầu đã được gửi!");
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white shadow-xl rounded-2xl p-8 md:p-12 w-full max-w-md">
                
                {/* Dựa vào isSuccess để hiển thị form hoặc thông báo thành công */}
                {isSuccess ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-green-600 mb-4">Kiểm tra Email của bạn</h2>
                        <p className="text-gray-600">
                            Một liên kết để đặt lại mật khẩu đã được gửi đến <span className="font-semibold">{email}</span>.
                            Vui lòng kiểm tra hộp thư của bạn.
                        </p>
                        <Link to="/login" className="mt-8 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                            <FaArrowLeft className="mr-2" />
                            Quay lại trang Đăng nhập
                        </Link>
                    </div>
                ) : (
                    <>
                        <h2 className="text-left text-3xl font-extrabold mb-2 text-blue-700">
                            Quên mật khẩu?
                        </h2>
                        <p className="text-gray-600 mb-8 text-left">
                            Đừng lo, chúng tôi sẽ giúp bạn.
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                                {isLoading ? <FaSpinner className="animate-spin" /> : 'Gửi liên kết khôi phục'}
                            </button>
                        </form>
                        
                        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

                        <div className="mt-8 text-center">
                            <Link to="/login" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                ← Quay về đăng nhập?
                            </Link>
                        </div>
                    </>
                )}
            </div>
            {/* ❌ Footer đã được xóa khỏi đây để đưa vào layout chung */}
        </div>
    );
}