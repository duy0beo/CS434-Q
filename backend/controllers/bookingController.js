import { Op } from 'sequelize';
import sequelize from '../config/db.js';
import Booking from '../models/Booking.js';
import BookingItem from '../models/BookingItem.js';
import Customer from '../models/Customer.js';
import Room from '../models/Room.js';
import RoomType from '../models/RoomType.js';
import User from '../models/User.js';


export async function createBooking(req, res) {
    const { roomTypeId, checkInDate, checkOutDate, totalGuests } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roomTypeId || !checkInDate || !checkOutDate || !totalGuests) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin đặt phòng.' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (checkOut <= checkIn) {
        return res.status(400).json({ message: 'Ngày trả phòng phải sau ngày nhận phòng.' });
    }
    
    if (checkIn < today) {
        return res.status(400).json({ message: 'Không thể đặt phòng cho một ngày trong quá khứ.' });
    }

    const t = await sequelize.transaction();

    try {
        const customer = await Customer.findOne({ where: { userId }, transaction: t });
        if (!customer) {
            await t.rollback();
            return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng.' });
        }

        // --- Thuật toán tìm phòng nâng cấp (đã đúng) ---
        const roomsOfType = await Room.findAll({ 
            where: { roomTypeId: roomTypeId },
            include: [{ model: RoomType, as: 'roomType' }],
            transaction: t 
        });

        if (roomsOfType.length === 0) {
            await t.rollback();
            return res.status(404).json({ message: 'Không tìm thấy loại phòng này.' });
        }

        const roomIds = roomsOfType.map(r => r.id);

        const conflictingBookings = await Booking.findAll({
            where: {
                checkInDate: { [Op.lt]: new Date(checkOutDate) },
                checkOutDate: { [Op.gt]: new Date(checkInDate) },
                status: { [Op.ne]: 'Cancelled' }
            },
            include: [{
                model: BookingItem,
                as: 'items',
                where: { roomId: { [Op.in]: roomIds } },
                required: true
            }],
            transaction: t
        });

        const busyRoomIds = conflictingBookings.flatMap(b => b.items.map(item => item.roomId));
        const availableRoom = roomsOfType.find(room => !busyRoomIds.includes(room.id));
        
        if (!availableRoom) {
            await t.rollback();
            return res.status(400).json({ message: 'Loại phòng này đã hết phòng trống trong khoảng thời gian bạn chọn.' });
        }

        // --- Các bước còn lại (đã đúng) ---
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const pricePerNight = Number(availableRoom.roomType.basePrice);
        const totalAmount = nights * pricePerNight;

        const newBooking = await Booking.create({
            customerId: customer.id,
            bookingDate: new Date(),
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalGuests,
            totalAmount,
            status: 'Pending',
        }, { transaction: t });

        await BookingItem.create({
            bookingId: newBooking.id,
            roomId: availableRoom.id,
            price: pricePerNight,
            quantity: nights 
        }, { transaction: t });

        // Không cần update status phòng nữa
        
        await t.commit();
        res.status(201).json({ message: 'Đơn hàng đã được tạo, vui lòng tiến hành thanh toán.', booking: newBooking });

    } catch (error) {
        await t.rollback();
        console.error('LỖI KHI TẠO BOOKING:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi server khi đặt phòng.' });
    }
}

export const getMyBookings = async (req, res) => {
    try {
        const customer = await Customer.findOne({ where: { userId: req.user.id } });

        if (!customer) {
            return res.status(200).json([]);
        }

        const bookings = await Booking.findAll({ 
            where: { customerId: customer.id, isHidden: false },
            order: [['checkInDate', 'DESC']], 
            include: [
                {
                    model: BookingItem,
                    as: 'items',
                    // ... include cho Room và RoomType giữ nguyên ...
                    include: [ 
                        {
                            model: Room,
                            as: 'room',
                            include: [{ model: RoomType, as: 'roomType' }]
                        }
                    ]
                },
                // ✅ THAY ĐỔI: Thêm include để lấy thông tin Customer và User
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['address'], // Lấy các trường cần thiết
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['first_name', 'last_name', 'email', 'phone']
                    }]
                }
            ]
        });

        res.status(200).json(bookings);

    } catch (error) {
        console.error("Lỗi khi lấy đơn đặt phòng:", error);
        res.status(500).json({ message: "Lỗi server khi lấy đơn đặt phòng" });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;

        const customer = await Customer.findOne({ where: { userId } });
        if (!customer) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng.' });
        }

        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Không tìm thấy đơn đặt phòng." });
        }

        // Kiểm tra xem người dùng có phải là chủ của đơn đặt phòng này không
        if (booking.customerId !== customer.id) {
            return res.status(403).json({ message: "Bạn không có quyền hủy đơn đặt phòng này." });
        }

        // Cập nhật trạng thái phòng về 'Available'
        const bookingItem = await BookingItem.findOne({ where: { bookingId } });
        if (bookingItem) {
            await Room.update({ status: 'Available' }, { where: { id: bookingItem.roomId } });
        }
        
        // Cập nhật trạng thái đơn đặt phòng
        await booking.update({ status: 'Cancelled' });

        res.status(200).json({ message: "Hủy đơn đặt phòng thành công." });
    } catch (error) {
        console.error("Lỗi khi hủy đơn:", error);
        res.status(500).json({ message: "Lỗi server khi hủy đơn." });
    }
};

export const hideBookingFromHistory = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        const customer = await Customer.findOne({ where: { userId: req.user.id } });

        // Xác thực người dùng
        if (!booking || booking.customerId !== customer.id) {
            return res.status(403).json({ message: "Không có quyền thực hiện hành động này." });
        }
        
        // Cập nhật trạng thái isHidden
        await booking.update({ isHidden: true });

        res.status(200).json({ message: "Đã xóa đơn khỏi lịch sử." });
    } catch (error) {
        console.error("Lỗi khi ẩn đơn:", error);
        res.status(500).json({ message: "Lỗi server." });
    }
};