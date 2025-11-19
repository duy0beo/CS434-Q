import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import { useAuth } from '../context/AuthContext'; // 1. Chỉ cần import useAuth
import api from '../services/api';
import toast from 'react-hot-toast';

const Footer = () => (
    <footer style={styles.footer}>
        Thông tin liên hệ: huynhngocti2409@gmail.com | Số điện thoại: 0329-324-649
        <br />
        © 2025 XTRAVEL. All Rights Reserved.
    </footer>
);


export default function Login() { 
    const [form, setForm] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [remember, setRemember] = useState(false);
    const navigate = useNavigate(); 
    const location = useLocation();

    const { login } = useAuth(); // 2. Lấy hàm `login` từ context

    useEffect(() => {
        const rememberedEmail = localStorage.getItem("rememberEmail");
        if (rememberedEmail) {
            setForm(prevForm => ({ ...prevForm, email: rememberedEmail }));
            setRemember(true);
        }
    }, []);

    // Hiển thị thông báo khi được chuyển hướng đến (ví dụ: sau khi đăng ký)
    useEffect(() => {
        if (location.state?.successMessage) {
            toast.success(location.state.successMessage);
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('Đang đăng nhập...');

        try {
            const res = await api.post('/auth/login', form);

            // 3. Gọi hàm `login` từ context, nó sẽ tự xử lý mọi thứ
            // bao gồm: lưu token, lưu role, cập nhật user state
            login(res.data.user, res.data.token); 

            // Xử lý Ghi nhớ email
            if (remember) {
                localStorage.setItem("rememberEmail", form.email);
            } else {
                localStorage.removeItem("rememberEmail");
            }
            
            toast.success('Đăng nhập thành công!', { id: toastId });
            
            // Chuyển hướng dựa trên vai trò
            if (res.data.user.role === "admin") {
                navigate("/admin");
            } else if (res.data.user.role === "employee") {
                navigate("/employee"); // <-- quan trọng
            } else {
                navigate("/");
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Sai tài khoản hoặc mật khẩu.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.loginBox}>
                <h2 style={styles.header}>Đăng Nhập</h2>
                <div style={styles.subHeader}>Vui lòng nhập thông tin tài khoản của bạn</div>
                <form style={styles.form} onSubmit={handleSubmit}>
                    <label htmlFor="email" style={styles.label}>Email</label>
                    <input
                        id="email" type="email" placeholder="Nhập email của bạn"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        style={styles.input} required
                    />
                    <label htmlFor="password" style={styles.label}>Mật Khẩu</label>
                    <input
                        id="password" type="password" placeholder="Nhập mật khẩu"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        style={styles.input} required
                    />
                    <div style={styles.optionsContainer}>
                        <label style={styles.checkboxLabel}>
                            <input 
                                type="checkbox" checked={remember} 
                                onChange={(e) => setRemember(e.target.checked)} 
                                style={{ marginRight: "6px" }}
                            />
                            Ghi nhớ email
                        </label>
                        <Link to="/forgot-password" style={styles.link}>Quên mật khẩu?</Link>
                    </div>
                    
                    <button type="submit" disabled={isLoading} style={{ ...styles.button, backgroundColor: isLoading ? "#9ca3af" : "#2563EB" }}>
                        {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                    </button>
                </form>
                <p style={styles.footerText}>
                    Bạn chưa có tài khoản?{" "}
                    <Link to="/register" style={styles.link}>Đăng ký ngay</Link>
                </p>
                <p style={{ ...styles.footerText, marginTop: '8px' }}>
                    <Link to="/" style={styles.link}>⬅ Quay về Trang Chủ</Link>
                </p>
            </div>
            <Footer />
        </div>
    );
}

// Style object giữ nguyên
const styles = {
    pageContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: '#f9fafb', padding: '20px' },
    loginBox: { padding: "40px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", backgroundColor: "white", maxWidth: "450px", width: "100%", boxSizing: "border-box" },
    header: { fontSize: "28px", fontWeight: "bold", color: "#2563eb", marginBottom: "8px", textAlign: "left" },
    subHeader: { fontSize: "16px", marginBottom: "24px", color: "#4b5563" },
    form: { display: "flex", flexDirection: "column", gap: "16px" },
    label: { fontSize: "14px", fontWeight: '500', color: '#374151' },
    input: { width: "100%", boxSizing: 'border-box', borderRadius: "8px", border: "1px solid #d1d5db", padding: "12px", fontSize: "15px", transition: 'border-color 0.2s' },
    optionsContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" },
    checkboxLabel: { display: "flex", alignItems: "center", fontSize: "14px", color: "#374151", cursor: 'pointer' },
    link: { fontSize: "14px", color: "#2563eb", fontWeight: "500", textDecoration: "none", transition: 'text-decoration 0.2s' },
    button: { width: "100%", border: "none", borderRadius: "8px", color: "white", padding: "12px 0", fontWeight: "600", cursor: "pointer", marginTop: "16px", fontSize: "16px", transition: 'background-color 0.2s' },
    footerText: { marginTop: "24px", fontSize: "15px", textAlign: "center", color: '#4b5563' },
    footer: { backgroundColor: "#0d1a2e", color: "#9ca3af", padding: "20px", textAlign: "center", fontSize: "12px", width: "100%", marginTop: 'auto' }
};