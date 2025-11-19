import Customer from '../models/Customer.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import BookingItem from '../models/BookingItem.js';
import Room from '../models/Room.js';               
import RoomType from '../models/RoomType.js'; 
import db from '../models/index.js';
import bcrypt from 'bcrypt';
import { Op, fn, col, where } from 'sequelize';

const { sequelize } = db;


// Lấy tất cả người dùng
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] } // Luôn loại bỏ mật khẩu
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng.' });
    }
};

// Lấy danh sách khách hàng kèm thông tin chi tiết
export const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            include: [{
                model: User,
                as: 'user',
                where: {
                    role: 'customer' 
                },
                required: true
            }],
            // SỬA LẠI DÒNG DƯỚI ĐÂY
            order: [
                [{ model: User, as: 'user' }, 'created_at', 'DESC']
            ]
        });
        res.status(200).json(customers);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khách hàng:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params; // Đây là userId
        // Lấy các trường có thể được cập nhật từ body
        const { firstName, lastName, phone, status } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }

        // Tạo một object chứa các dữ liệu cần cập nhật
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (firstName || lastName) {
            updateData.fullName = `${firstName || user.firstName} ${lastName || user.lastName}`.trim();
        }
        if (phone) updateData.phone = phone;
        if (status) updateData.status = status; // Dùng để Vô hiệu hóa / Kích hoạt

        // Cập nhật các trường có trong updateData
        await user.update(updateData);
        
        // Trả về user đã được cập nhật (loại bỏ password)
        const { password, ...userWithoutPassword } = user.get({ plain: true });
        res.status(200).json(userWithoutPassword);

    } catch (error) {
        console.error("Lỗi khi cập nhật người dùng:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật" });
    }
};

export const getAllBookingsAdmin = async (req, res) => {
    try {
        const { status, customerName, startDate, endDate } = req.query;

        const bookingWhere = {};
        if (status) bookingWhere.status = status;
        // ✅ CẢI TIẾN: Lọc theo khoảng thời gian
        if (startDate && endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            bookingWhere.checkInDate = {
                [Op.between]: [new Date(startDate), endOfDay]
            };
        }

        const userWhere = {};
        if (customerName) {
            userWhere[Op.or] = [
                { firstName: { [Op.like]: `%${customerName}%` } },
                { lastName: { [Op.like]: `%${customerName}%` } },
                { email: { [Op.like]: `%${customerName}%` } }
            ];
        }
        
        const bookings = await Booking.findAll({
            where: bookingWhere,
            order: [['checkInDate', 'DESC']],
            include: [
                {
                    model: Customer, as: 'customer', required: true,
                    include: { model: User, as: 'user', where: userWhere, required: true, attributes: ['firstName', 'lastName', 'email', 'phone'] }
                },
                {
                    model: BookingItem, as: 'items', required: true,
                    include: { model: Room, as: 'room', include: { model: RoomType, as: 'roomType' } }
                }
            ]
        });
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách booking cho admin:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const booking = await Booking.findByPk(id, {
             include: [{ model: Customer, as: 'customer', include: { model: User, as: 'user' }}]
        });
        if (!booking) {
            return res.status(404).json({ message: "Không tìm thấy đơn đặt phòng." });
        }

        const oldStatus = booking.status;
        booking.status = status;
        await booking.save();

        // Nếu chuyển trạng thái sang "Confirmed", gửi email xác nhận
        if (oldStatus === 'Pending' && status === 'Confirmed') {
            // sendBookingConfirmationEmail(booking); // Gửi email cho khách
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái booking:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

export const getAllEmployees = async (req, res) => {
    try {
        const employees = await User.findAll({
            where: {
                role: 'employee',
                // Thêm điều kiện để không lấy chính admin đang đăng nhập
                id: { [Op.ne]: req.user.id } 
            },
            attributes: { exclude: ['password'] }
        });
        res.status(200).json(employees);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nhân viên:", error);
        res.status(500).json({ message: "Lỗi server." });
    }
};

// HÀM MỚI: Tạo tài khoản nhân viên
export const createEmployee = async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin." });
    }
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email đã được sử dụng.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            role: 'employee', // Gán vai trò cố định
            status: 'Active'
        });

        const { password: _, ...employeeData } = newEmployee.get({ plain: true });
        res.status(201).json(employeeData);
    } catch (error) {
        console.error("Lỗi khi tạo nhân viên:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo nhân viên.' });
    }
};