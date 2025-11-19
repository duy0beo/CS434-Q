// src/controllers/payment.controller.js
import crypto from 'crypto';
import querystring from 'qs';
import moment from 'moment';
import Booking from '../models/Booking.js'; // Import model Booking

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

export const createPaymentUrl = async (req, res) => {
    const { bookingId } = req.body;
    const booking = await Booking.findByPk(bookingId);

    if (!booking || booking.status !== 'Pending') {
        return res.status(400).json({ message: 'Đơn hàng không hợp lệ.' });
    }

    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    const orderId = booking.id + '_' + moment(date).format('DDHHmmss');
    const amount = Number(booking.totalAmount); 
    const orderInfo = `Thanh toan don hang ${booking.id}`;
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Amount'] = amount * 100; // VNPay yêu cầu nhân 100
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_TxnRef'] = orderId;

    vnp_Params = sortObject(vnp_Params);
    
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;

    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    
    res.json({ paymentUrl: vnpUrl });
};

// HÀM XỬ LÝ KẾT QUẢ IPN
export const vnpayIpn = async (req, res) => {
    console.log("\n--- BẮT ĐẦU XỬ LÝ YÊU CẦU IPN TỪ VNPAY ---");
    let vnp_Params = req.query;
    console.log("1. Dữ liệu VNPay trả về:", vnp_Params);

    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa các trường hash để kiểm tra chữ ký
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params); // Hàm này đã sửa đúng ở lần trước
    
    const secretKey = process.env.VNP_HASHSECRET;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    console.log("2. Chữ ký chúng ta tạo ra:", signed);
    console.log("3. Chữ ký VNPay gửi về:", secureHash);

    // Bắt đầu kiểm tra
    if (secureHash === signed) {
        console.log(">>> BƯỚC 4: KIỂM TRA CHỮ KÝ THÀNH CÔNG <<<");
        const orderId = vnp_Params['vnp_TxnRef'].split('_')[0];
        const rspCode = vnp_Params['vnp_ResponseCode'];
        
        console.log(`5. Mã đơn hàng: ${orderId}, Mã giao dịch VNPay: ${rspCode}`);

        try {
            const booking = await Booking.findByPk(orderId);

            if (booking) {
                console.log("6. Tìm thấy đơn hàng trong DB. Trạng thái hiện tại:", booking.status);
                if (booking.status === 'Pending') {
                    if (rspCode === '00') {
                        console.log("7. Giao dịch thành công trên VNPay. Bắt đầu cập nhật trạng thái...");
                        await booking.update({ status: 'Confirmed' });
                        console.log(">>> BƯỚC 8: CẬP NHẬT TRẠNG THÁI THÀNH 'CONFIRMED' THÀNH CÔNG <<<");
                        res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
                    } else {
                        console.log("7. Giao dịch thất bại trên VNPay. Cập nhật trạng thái thành 'Cancelled'...");
                        await booking.update({ status: 'Cancelled' });
                        res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
                    }
                } else {
                    console.log("Đơn hàng đã được xử lý trước đó. Không cần cập nhật.");
                    res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
                }
            } else {
                console.error(`!!! LỖI: Không tìm thấy đơn hàng với ID: ${orderId}`);
                res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }
        } catch (dbError) {
             console.error("!!! LỖI DATABASE KHI CẬP NHẬT:", dbError);
             res.status(200).json({ RspCode: '99', Message: 'Internal Server Error' });
        }
    } else {
        console.error("!!! LỖI NGHIÊM TRỌNG: KIỂM TRA CHỮ KÝ THẤT BẠI !!!");
        res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }
};

export const vnpayReturn = async (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNP_HASHSECRET;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    const clientReturnUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    if (secureHash === signed) {
        // Chữ ký hợp lệ, chuyển hướng người dùng về trang kết quả với các tham số
        const queryString = querystring.stringify(vnp_Params, { encode: false });
        res.redirect(`${clientReturnUrl}/booking-result?${queryString}`);
    } else {
        // Chữ ký không hợp lệ, chuyển hướng về trang lỗi
        res.redirect(`${clientReturnUrl}/booking-result?vnp_ResponseCode=97`);
    }
};