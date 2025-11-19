import { Sequelize } from 'sequelize';
import RoomType from '../models/RoomType.js';
// THÊM CÁC IMPORT BỊ THIẾU Ở ĐÂY
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import BookingItem from '../models/BookingItem.js';
import Room from '../models/Room.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';

// GET /api/room-types - Lấy tất cả loại phòng
export const getAllRoomTypes = async (req, res) => {
    try {
        const roomTypes = await RoomType.findAll({
            attributes: {
                // Giữ lại tất cả các cột của RoomType và thêm 2 cột mới
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT AVG(r.rating)
                            FROM review r
                            JOIN booking b ON r.booking_id = b.id
                            JOIN booking_items bi ON bi.booking_id = b.id
                            JOIN room rm ON bi.room_id = rm.id
                            WHERE rm.room_type_id = RoomType.id
                        )`),
                        'averageRating'
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(r.id)
                            FROM review r
                            JOIN booking b ON r.booking_id = b.id
                            JOIN booking_items bi ON bi.booking_id = b.id
                            JOIN room rm ON bi.room_id = rm.id
                            WHERE rm.room_type_id = RoomType.id
                        )`),
                        'reviewCount'
                    ]
                ]
            },
            order: [['name', 'ASC']]
        });
        res.status(200).json(roomTypes);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu loại phòng:", error);
        res.status(500).json({ message: "Lỗi server khi lấy dữ liệu." });
    }
};

// POST /api/room-types - Tạo loại phòng mới
export const createRoomType = async (req, res) => {
    try {
        const { name, description, basePrice, maxOccupancy } = req.body;
        let photoUrl = '';

        // Phải lấy đường dẫn từ req.file
        if (req.file) {
            photoUrl = '/uploads/' + req.file.filename;
        }
        const newRoomType = await RoomType.create({ name, description, basePrice, maxOccupancy, photoUrl });
        res.status(201).json(newRoomType);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi tạo mới." });
    }
};

export const getRoomTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const roomType = await RoomType.findByPk(id);

        if (!roomType) {
            return res.status(404).json({ message: "Không tìm thấy loại phòng." });
        }
        res.status(200).json(roomType);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi lấy dữ liệu." });
    }
};

// PUT /api/room-types/:id - Cập nhật loại phòng
export const updateRoomType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, basePrice, maxOccupancy } = req.body;
        
        const roomType = await RoomType.findByPk(id);
        if (!roomType) return res.status(404).json({ message: "Không tìm thấy loại phòng." });
        
        const updateData = { name, description, basePrice, maxOccupancy };

        if (req.file) {
            updateData.photoUrl = '/uploads/' + req.file.filename;
        }

        await roomType.update(updateData);
        res.status(200).json(roomType);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi cập nhật." });
    }
};

// DELETE /api/room-types/:id - Xóa loại phòng
export const deleteRoomType = async (req, res) => {
    try {
        const { id } = req.params;
        const roomType = await RoomType.findByPk(id);
        if (!roomType) return res.status(404).json({ message: "Không tìm thấy loại phòng." });

        await roomType.destroy();
        res.status(200).json({ message: "Xóa loại phòng thành công." });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi xóa." });
    }
};

export const getReviewsForRoomType = async (req, res) => {
    try {
        const { id } = req.params; 

        const reviews = await Review.findAll({
            include: [{
                model: Booking,
                as: 'booking',
                // ...
                include: [
                    {
                        model: Customer,
                        as: 'customer',
                        // ...
                        include: [{
                            model: User,
                            as: 'user',
                            // SỬA LẠI Ở ĐÂY
                            attributes: ['first_name', 'last_name'] 
                        }]
                    },
                    // ...
                ]
            }],
            // ...
        });

        res.status(200).json(reviews);
    } catch (error) {
        console.error("Lỗi khi lấy đánh giá:", error);
        res.status(500).json({ message: "Lỗi server khi lấy đánh giá." });
    }
};