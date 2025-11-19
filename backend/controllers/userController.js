import { Op } from 'sequelize';
import db from '../models/index.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const { User, Customer, sequelize } = db;

export const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{
                model: Customer,
                as: 'customer',
            }],
            attributes: { exclude: ['password'] } 
        });
        
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

export const updateUserProfile = async (req, res) => {
    const userId = req.user.id;
    const { firstName, lastName, phone, customer } = req.body;
    const t = await sequelize.transaction();
    try {
        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        await user.update({ firstName, lastName, phone }, { transaction: t });

        const customerProfile = await Customer.findOne({ where: { userId }, transaction: t });
        if (customerProfile) {
            await customerProfile.update({
                address: customer.address,
                city: customer.city,
                country: customer.country,
                id_number: customer.id_number
            }, { transaction: t });
        }
        await t.commit();
        
        const updatedUserWithCustomer = await User.findByPk(userId, {
            include: { model: Customer, as: 'customer' },
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            message: 'Cập nhật hồ sơ thành công!',
            user: updatedUserWithCustomer
        });
    } catch (error) {
        await t.rollback();
        console.error("Lỗi khi cập nhật hồ sơ:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật hồ sơ." });
    }
};

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn một file ảnh.' });
        }
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        const avatarUrl = `/uploads/${req.file.filename}`;
        await user.update({ avatar: avatarUrl });
        res.status(200).json({ 
            message: 'Tải ảnh đại diện thành công!', 
            avatarUrl: avatarUrl 
        });
    } catch (error) {
        console.error("Lỗi khi tải ảnh đại diện:", error);
        res.status(500).json({ message: "Lỗi server khi tải ảnh đại diện." });
    }
};

export const changePassword = async (req, res) => {
    // Frontend của bạn gửi 'currentPassword' và 'newPassword'
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu cũ và mới.' });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        // So sánh mật khẩu hiện tại người dùng nhập với mật khẩu trong DB
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác.' });
        }

        // Mã hóa mật khẩu mới và lưu lại
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Đổi mật khẩu thành công.' });

    } catch (error) {
        console.error("Lỗi khi đổi mật khẩu:", error);
        res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu.' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng với email này.' });
        }

        // Tạo token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // Hết hạn sau 1 giờ

        await user.save();

        // **QUAN TRỌNG:** Trong thực tế, bạn sẽ gửi email ở đây.
        // Bây giờ, chúng ta sẽ chỉ in link ra console để test.
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        console.log('Link reset mật khẩu (gửi cho người dùng):', resetUrl);

        res.status(200).json({ message: 'Yêu cầu reset mật khẩu đã được gửi. Vui lòng kiểm tra email.' });
    } catch (error) {
        console.error("Lỗi forgotPassword:", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// ✅ HÀM XỬ LÝ KHI USER NHẬP MK MỚI
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { [Op.gt]: Date.now() } // Token chưa hết hạn
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }

        // Cập nhật mật khẩu mới
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null; // Xóa token sau khi dùng
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: 'Mật khẩu đã được cập nhật thành công.' });
    } catch (error) {
        console.error("Lỗi resetPassword:", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};