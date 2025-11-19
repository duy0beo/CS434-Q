import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom"; 
import api from '../services/api';

export default function Register() {
    // State cho form, bao gồm TẤT CẢ các trường cần thiết cho CSDL
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        address: "",
        city: "",
        country: "",
        idNumber: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        if (form.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            setIsLoading(false);
            return;
        }

        try {
            await api.post('/auth/register', form);
            // Chuyển hướng đến trang đăng nhập với thông báo thành công
            navigate('/login', {
                state: { successMessage: "Đăng ký thành công! Vui lòng đăng nhập." }
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Bố cục tổng thể
        <div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", background: "#f9fafb", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}>
                {/* Box đăng ký - Đã tinh chỉnh kích thước */}
                <div style={{
                    padding: "30px",
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "white",
                    margin: "40px 0",
                    maxWidth: "550px", // Rộng hơn một chút để chứa nhiều trường
                    width: "100%",
                    boxSizing: "border-box",
                    }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center", color: "#2563eb", marginBottom: "24px", marginTop: 0 }}>
                        Đăng Ký Tài Khoản
                    </h2>

                    <form style={{ display: "flex", flexDirection: "column", gap: "14px" }} onSubmit={handleSubmit} autoComplete='off'>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                            <div>
                                <label style={{ marginBottom: "6px", fontWeight: "500", fontSize: "15px", display: "block" }}>Họ</label>
                                <input name="lastName" type="text" placeholder="Nhập họ của bạn" value={form.lastName} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", borderRadius: "8px", padding: "10px", border: "1px solid #ccc", fontSize: "12px" }} required />
                            </div>
                            <div>
                                <label style={{ marginBottom: "6px", fontWeight: "500", fontSize: "15px", display: "block" }}>Tên</label>
                                <input name="firstName" type="text" placeholder="Nhập tên của bạn" value={form.firstName} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", borderRadius: "8px", padding: "10px", border: "1px solid #ccc", fontSize: "12px" }} required />
                            </div>
                        </div>
                        
                        <label style={{ fontWeight: "500", fontSize: "15px" }}>Email</label>
                        <input name="email" type="email" placeholder="email@example.com" value={form.email} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", borderRadius: "8px", padding: "10px", border: "1px solid #ccc", fontSize: "12px" }} required />
                        
                        <label style={{ fontWeight: "500", fontSize: "15px" }}>Số Điện Thoại</label>
                        <input name="phone" type="tel" placeholder="+84 123-456-789" value={form.phone} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", borderRadius: "8px", padding: "10px", border: "1px solid #ccc", fontSize: "12px" }} />
                        
                        <label style={{ fontWeight: "500", fontSize: "15px" }}>Mật Khẩu</label>
                        <input name="password" type="password" placeholder="Nhập mật khẩu" value={form.password} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", borderRadius: "8px", padding: "10px", border: "1px solid #ccc", fontSize: "12px" }} required autoComplete='new-password' />

                        {/* === KHÔI PHỤC CÁC TRƯỜNG PHỤ === */}
                        <label style={{ fontWeight: "500", fontSize: "15px" }}>Địa Chỉ</label>
                        <input name="address" type="text" placeholder="Nhập địa chỉ" value={form.address} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", borderRadius: "8px", padding: "10px", border: "1px solid #ccc", fontSize: "12px" }} />
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                            <div>
                                <label style={{ marginBottom: "6px", fontWeight: "500", fontSize: "15px", display: "block" }}>Thành Phố</label>
                                <input name="city" type="text" placeholder="Nhập thành phố" value={form.city} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", borderRadius: "8px", padding: "10px", border: "1px solid #ccc", fontSize: "12px" }} />
                            </div>
                            <div>
                                <label style={{ marginBottom: "6px", fontWeight: "500", fontSize: "15px", display: "block" }}>Quốc Gia</label>
                                <input name="country" type="text" placeholder="Nhập quốc gia" value={form.country} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", borderRadius: "8px", padding: "10px", border: "1px solid #ccc", fontSize: "12px" }} />
                            </div>
                        </div>
                        
                        <label style={{ fontWeight: "500", fontSize: "15px" }}>Số CMND/CCCD</label>
                        <input name="idNumber" type="text" placeholder="Nhập CMND/CCCD" value={form.idNumber} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", borderRadius: "8px", padding: "10px", border: "1px solid #ccc", fontSize: "12px" }} />

                        {/* Thông báo lỗi và thành công */}
                        {error && <p style={{ color: "red", fontSize: "14px", textAlign: "center", margin: "10px 0 0" }}>{error}</p>}
                        {success && <p style={{ color: "green", fontSize: "14px", textAlign: "center", margin: "10px 0 0" }}>{success}</p>}

                        <button type="submit" disabled={isLoading} style={{ width: "180px", fontSize: "16px", border: "none", borderRadius: "8px", backgroundColor: isLoading ? "#9ca3af" : "#2563EB", color: "white", padding: "12px 0", fontWeight: "600", cursor: "pointer", margin: "16px auto 0 auto" }}>
                            {isLoading ? "Đang xử lý..." : "Đăng Ký"}
                        </button>
                    </form>

                    <p style={{ marginTop: "20px", fontSize: "15px", textAlign: "center" }}>
                        <Link to="/login" style={{ color: "#2563eb", fontWeight: "500", textDecoration: "none" }}>
                            Đã có tài khoản? Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
            <div>
                <footer style={{
                backgroundColor: "#0d1a2e",
                color: "#ccc",
                padding: "40px 50PX", 
                textAlign: "center",
                fontSize: "12px", 
                borderTop: "1px solid #2a3a4a",
                width: "100%",
                bottom: 0,
                left: 0,
                }}>
                Thông tin liên hệ: huynhngocti2409@gmail.com | Số điện thoại: 0329-324-649
                <br />
                © 2025 XTRAVEL. All Rights Reserved.
                </footer>
            </div>
        </div>
    );
}

