import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import api from "../services/api";
import BookingModal from "../components/BookingModal";
import toast from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";

// --- Component Icon Sao ---
const StarIcon = ({ fill }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={fill} stroke="#ffc107" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

// --- Component Icon Mũi tên ---
const ArrowIcon = ({ direction = 'right' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={direction === 'left' ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}></polyline>
    </svg>
);

// --- Component Đánh giá Sao ---
const StarRating = ({ rating = 0, reviewCount = 0 }) => {
    const fullStars = Math.round(rating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(<StarIcon key={i} fill={i <= fullStars ? "#ffc107" : "none"} />);
    }
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {stars}
            <span style={{ fontSize: '14px', color: '#6b7280' }}>({reviewCount} đánh giá)</span>
        </div>
    );
};

// --- Component Home ---
export default function Home() {
    const { isAuthenticated } = useAuth();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [roomTypes, setRoomTypes] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const mockPosts = [
        { id: 1, category: 'TRẢI NGHIỆM', date: '05/09/2025', title: 'Khám Phá Ẩm Thực Địa Phương', excerpt: 'Những món ăn không thể bỏ lỡ khi bạn đến với chúng tôi...', imageUrl: '/images/monandiaphuongdn.png' },
        { id: 2, category: 'ƯU ĐÃI', date: '01/09/2025', title: 'Ưu Đãi Mùa Thu Lãng Mạn', excerpt: 'Tận hưởng kỳ nghỉ của bạn...', imageUrl: '/images/post-romance.jpg' }
    ];
    const galleryImages = ['/images/anhdepht1.jpg', '/images/anhdepht2.jpg', '/images/anhdepht3.jpg', '/images/anhdepht4.webp'];

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const roomRes = await api.get('/room-types');
                setRoomTypes(roomRes.data);
            } catch (error) {
                console.error("Không thể tải dữ liệu phòng:", error);
            }
        };
        fetchRoomTypes();
    }, []);

    const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % galleryImages.length);
    const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length);

    const sectionStyle = { padding: '60px 50px', borderBottom: '1px solid #f0f0f0' };
    const sectionTitleStyle = { fontSize: '32px', fontWeight: 'bold', color: '#0d1a2e', textAlign: 'center', marginBottom: '15px' };
    const sectionSubtitleStyle = { fontSize: '16px', color: '#6b7280', textAlign: 'center', marginBottom: '50px', maxWidth: '600px', margin: '0 auto 50px auto', lineHeight: 1.6 };

    return (
        <div>
            {/* Banner */}
            <section id="home" style={{ position: "relative", height: "80vh", marginTop: '-105px', overflow: "hidden" }}>
                <video autoPlay loop muted playsInline src="/videos/banner.mp4" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }} />
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)", zIndex: 2 }}></div>
                <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center", height: "100%", color: "white", textAlign: 'center' }}>
                    <h1 style={{ fontSize: "4rem", fontWeight: "900", margin: 0, textShadow: '2px 2px 8px rgba(0,0,0,0.6)' }}>XTRAVEL KÍNH CHÀO</h1>
                    <p style={{ fontSize: "1.25rem", marginTop: '10px', textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}>Kiến tạo kỳ nghỉ trong mơ của bạn, bắt đầu từ hôm nay.</p>
                </div>
            </section>

            <section id="about" style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Câu Chuyện Của XTRAVEL</h2>
                <p style={sectionSubtitleStyle}>Ra đời từ niềm đam mê kiến tạo những kỳ nghỉ đáng nhớ, XTRAVEL không chỉ là một điểm đến, mà là ngôi nhà thứ hai nơi mọi cảm xúc của bạn được trân trọng.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '50px', maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ flex: 1 }}><img src="/images/about-us.jpg" alt="Nội thất sang trọng của khách sạn" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} /></div>
                    <div style={{ flex: 1 }}><h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0d47a1' }}>Hơn Cả Một Kỳ Nghỉ, Đó Là Hành Trình Cảm Xúc</h3><p style={{ fontSize: '15px', lineHeight: 1.7, color: '#333' }}>Chúng tôi tin rằng mỗi chuyến đi là một chương mới trong câu chuyện của bạn. Vì vậy, tại XTRAVEL, từng chi tiết nhỏ từ không gian kiến trúc đến dịch vụ tận tâm đều được chăm chút để viết nên những kỷ niệm đẹp đẽ và riêng tư nhất cho bạn và người thân.</p></div>
                </div>
            </section>

            {/* Rooms */}
            <section id="rooms" style={{ ...sectionStyle, background: '#f9fafb' }}>
                <h2 style={sectionTitleStyle}>Không Gian Nghỉ Dưỡng Tinh Tế</h2>
                <p style={sectionSubtitleStyle}>Mỗi căn phòng là một tuyệt tác kiến trúc riêng, nơi sự sang trọng hòa quyện cùng cảm giác ấm cúng, thân thuộc. Hãy tìm cho mình không gian hoàn hảo để tái tạo năng lượng và tận hưởng sự thư thái tuyệt đối.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                    {roomTypes.map(room => (
                        <div key={room.id} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <img src={`http://localhost:5000${room.photoUrl}`} alt={room.name} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#0d47a1' }}>{room.name}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{new Intl.NumberFormat('vi-VN').format(room.basePrice)} VNĐ/đêm</span>
                                    <StarRating rating={5} />
                                </div>
                                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                    {isAuthenticated ? (
                                        // Khi đã đăng nhập, hiển thị cả 2 nút
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <Link 
                                                to={`/room-type/${room.id}`}
                                                style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#e5e7eb', color: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', transition: 'background-color 0.3s' }}
                                            >
                                                Xem chi tiết
                                            </Link>
                                            <button 
                                                onClick={() => setSelectedRoom(room)} 
                                                style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.3s' }}
                                            >
                                                Đặt Ngay
                                            </button>
                                        </div>
                                    ) : (
                                        // Khi chưa đăng nhập, chỉ hiển thị 1 nút
                                        <Link 
                                            to={`/room-type/${room.id}`}
                                            style={{ display: 'block', textAlign: 'center', width: '100%', padding: '12px', background: '#111827', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', transition: 'background-color 0.3s' }}
                                        >
                                            Xem chi tiết
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="posts" style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Tin Tức & Ưu Đãi Độc Quyền</h2>
                <p style={sectionSubtitleStyle}>Đừng bỏ lỡ những câu chuyện truyền cảm hứng và các ưu đãi đặc biệt được thiết kế riêng cho kỳ nghỉ của bạn tại XTRAVEL.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '1100px', margin: '0 auto' }}>
                    {mockPosts.map(post => (
                        <div key={post.id} style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <img src={post.imageUrl} alt={post.title} style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '12px' }} />
                            <div>
                                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#00aaff', fontWeight: 'bold' }}>{post.category} - {post.date}</p>
                                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#0d1a2e' }}>{post.title}</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{post.excerpt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="gallery" style={{ ...sectionStyle, background: '#f9fafb', paddingBottom: '80px' }}>
                <h2 style={sectionTitleStyle}>Khoảnh Khắc Tại XTRAVEL</h2>
                <p style={sectionSubtitleStyle}>Những nụ cười, những giây phút thư giãn, những kỷ niệm được ghi lại. Hãy xem vì sao các vị khách lại yêu mến XTRAVEL đến vậy.</p>
                <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
                    <div style={{ overflow: 'hidden', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', transition: 'transform 0.5s ease-in-out', transform: `translateX(-${currentImageIndex * 100}%)` }}>
                            {galleryImages.map((src, index) => (<img key={index} src={src} alt={`Khoảnh khắc ${index + 1}`} style={{ width: '100%', height: 'auto', display: 'block', flexShrink: 0 }} />))}
                        </div>
                    </div>
                    <button onClick={prevImage} style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowIcon direction="left" /></button>
                    <button onClick={nextImage} style={{ position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowIcon direction="right" /></button>
                </div>
            </section>

            {selectedRoom && (
                <BookingModal 
                    roomType={selectedRoom} 
                    onClose={() => setSelectedRoom(null)} 
                    onSuccess={(msg) => {
                        toast.success(msg);
                        setSelectedRoom(null);
                    }}
                />
            )}
        </div>
    );
}