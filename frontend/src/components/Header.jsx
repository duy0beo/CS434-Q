import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

// Header giờ nhận props từ MainLayout
export default function Header({ user, isLoading, onLogout }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Logic để đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header>
            {/* Top Bar */}
            <div style={{ background: "#0d1a2e", color: "#ccc", padding: "8px 50px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <span>Chào Mừng Bạn Đến Với Khách Sạn Của Chúng Tôi</span>
                <div style={{ position: 'relative' }}>
                     {isLoading ? (<span>Loading...</span>) : user ? (
                        <div ref={dropdownRef}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: 'pointer' }} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <img src={user.avatar || '/images/avatar.png'} alt="avatar" style={{ borderRadius: "50%", width: "28px", height: "28px" }} />
                                <span>Chào, {user.firstName}</span>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                             {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div style={{ position: 'absolute', top: '140%', right: 0, background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1100, width: '200px', overflow: 'hidden' }}>
                                    <Link to="my-account" onClick={() => setIsDropdownOpen(false)} style={{ display: 'block', padding: '12px 15px', color: '#333', textDecoration: 'none' }}>Tài Khoản Của Tôi</Link>
                                    <div style={{ borderTop: '1px solid #eee' }}>
                                        <button onClick={onLogout} style={{ width: '100%', background: 'none', border: 'none', padding: '12px 15px', textAlign: 'left', cursor: 'pointer', color: '#ef4444', fontSize: '14px' }}>
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: "#ccc", textDecoration: "none", marginRight: '20px' }}>Đăng nhập</Link>
                            <Link to="/register" style={{ color: "#ccc", textDecoration: "none" }}>Đăng ký</Link>
                        </>
                    )}
                </div>
            </div>
            {/* Main Header */}
            <div style={{ background: "#fff", color: "#333", padding: "20px 50px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div style={{ display: "flex", alignItems: "center", fontWeight: "bold", fontSize: "28px", color: '#0d47a1' }}>
                        <img src="/images/logo.png" alt="XTravel Logo" style={{ width: "50px", height: "50px", marginRight: "12px", borderRadius: '50%' }}/>
                        <div style={{ lineHeight: 1.1 }}>
                            <span>XTRAVEL</span>
                            <span style={{color: '#888', fontSize: '13px', display: 'block', fontWeight: 'normal'}}>TRAVEL AGENCY</span>
                        </div>
                    </div>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <PhoneIcon />
                        <div>
                            <div style={{fontWeight: 'bold', fontSize: '16px'}}>+84 0329-324-649</div>
                            <div style={{fontSize: '13px', color: '#888'}}>24/7 Help Support</div>
                        </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <input type="search" placeholder="Search..." style={{ padding: '10px 18px', borderRadius: '30px', border: '1px solid #ddd', minWidth: '250px', fontSize: '15px' }} />
                    </div>
                </div>
            </div>
        </header>
    );
}