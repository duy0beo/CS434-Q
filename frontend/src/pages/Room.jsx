import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const RoomCard = ({ room }) => (
    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <img 
            src={room.RoomType.photoUrl || '/images/room-placeholder.png'} 
            alt={room.RoomType.name} 
            style={{ width: '100%', height: '250px', objectFit: 'cover' }} 
        />
        <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#0d47a1' }}>
                {room.RoomType.name} - P.{room.roomNumber}
            </h3>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 15px 0' }}>
                Tầng {room.floor} | Trạng thái: 
                <span style={{ fontWeight: 'bold', color: room.status === 'Available' ? '#10b981' : '#ef4444' }}>
                    {room.status === 'Available' ? ' Trống' : ' Có khách'}
                </span>
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    {new Intl.NumberFormat('vi-VN').format(room.RoomType.basePrice)} VNĐ/đêm
                </span>
                <Link to={`/rooms/${room.id}`} style={{ padding: '10px 20px', background: '#00aaff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }}>
                    Đặt Ngay
                </Link>
            </div>
        </div>
    </div>
);

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Đổi tên cho nhất quán
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get('/rooms');
                setRooms(response.data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách phòng:", error);
                setError("Không thể tải danh sách phòng. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false); 
            }
        };
        fetchRooms(); 
    }, []);

    return (
        <div style={{ background: '#f9fafb', padding: '40px 50px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#0d1a2e', textAlign: 'center', marginBottom: '15px' }}>
                Danh Sách Phòng
            </h1>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '50px', maxWidth: '700px', margin: '0 auto 50px auto' }}>
                Chọn cho mình không gian nghỉ dưỡng hoàn hảo từ danh sách các phòng tiện nghi của chúng tôi.
            </p>

            {isLoading && <p style={{ textAlign: 'center' }}>Đang tải danh sách phòng...</p>}
            {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
            
            {!isLoading && !error && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                    {rooms.map(room => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </div>
            )}
        </div>
    );
}