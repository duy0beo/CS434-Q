import Room from '../models/Room.js';
import RoomType from '../models/RoomType.js';

// GET /api/room-types - Lấy tất cả loại phòng KÈM THEO ĐÁNH GIÁ
export const getAllRoomTypes = async (req, res) => {
    try {
        const roomTypes = await RoomType.findAll({
            attributes: {
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

// GET /api/rooms - Lấy tất cả phòng và thông tin loại phòng đi kèm
export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.findAll({
            include: [{
                model: RoomType,
                as: 'roomType',
                attributes: ['name', 'basePrice', 'photoUrl']
            }],
            order: [['roomNumber', 'ASC']]
        });
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi lấy dữ liệu." });
    }
};

// POST /api/rooms - Tạo phòng mới
export const createRoom = async (req, res) => {
    try {
        const newRoom = await Room.create(req.body);
        res.status(201).json(newRoom);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi tạo mới." });
    }
};

// PUT /api/rooms/:id - Cập nhật phòng
export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findByPk(id);
        if (!room) return res.status(404).json({ message: "Không tìm thấy phòng." });

        await room.update(req.body);
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi cập nhật." });
    }
};

// DELETE /api/rooms/:id - Xóa phòng
export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findByPk(id);
        if (!room) return res.status(404).json({ message: "Không tìm thấy phòng." });
        
        await room.destroy();
        res.status(200).json({ message: "Xóa phòng thành công." });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi xóa." });
    }
};

