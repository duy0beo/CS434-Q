import api from './api';

// =============================================
// == QUẢN LÝ ĐẶT PHÒNG (BOOKING MANAGEMENT) ==
// =============================================

/**
 * [Admin/Employee] Lấy TẤT CẢ các đơn đặt phòng
 */
const getAllBookings = (params) => {
    // Gửi các tham số lọc dưới dạng query string
    return api.get('/admin/bookings', { params });
};

/**
 * [Admin/Employee] Cập nhật trạng thái của một đơn đặt phòng
 * @param {string} id - ID của booking
 * @param {string} status - Trạng thái mới (e.g., 'CheckedIn', 'Completed')
 */
const updateBookingStatus = (id, status) => {
    return api.patch(`/admin/bookings/${id}/status`, { status });
};


// =============================================
// == QUẢN LÝ KHÁCH HÀNG (CUSTOMER MANAGEMENT) ==
// =============================================

/**
 * [Admin/Employee] Lấy TẤT CẢ danh sách khách hàng
 */
const getAllCustomers = () => {
    return api.get('/admin/customers');
};

/**
 * [Admin/Employee] Cập nhật thông tin của một người dùng (khách hàng)
 * @param {string} userId - ID của user
 * @param {object} userData - Dữ liệu cần cập nhật (e.g., { firstName, status })
 */
const updateUser = (userId, userData) => {
    return api.put(`/admin/users/${userId}`, userData);
};


// ====================================================
// == QUẢN LÝ LOẠI PHÒNG (ROOM TYPE MANAGEMENT) ==
// ====================================================

/**
 * [Admin/Employee] Lấy TẤT CẢ các loại phòng
 */
const getAllRoomTypes = () => {
    // Endpoint này có thể dùng chung cho cả khách và admin
    return api.get('/room-types');
};

/**
 * [Admin/Employee] Tạo một loại phòng mới (bao gồm cả file ảnh)
 * @param {FormData} formData - Đối tượng FormData chứa thông tin và file ảnh
 */
const createRoomType = (formData) => {
    // Endpoint này cần được bảo vệ cho admin/employee
    return api.post('/admin/room-types', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

/**
 * [Admin/Employee] Cập nhật một loại phòng (bao gồm cả file ảnh nếu có)
 * @param {string} id - ID của loại phòng
 * @param {FormData} formData - Đối tượng FormData chứa thông tin và file ảnh
 */
const updateRoomType = (id, formData) => {
    // Endpoint này cần được bảo vệ cho admin/employee
    return api.put(`/admin/room-types/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

/**
 * [Admin/Employee] Xóa một loại phòng
 * @param {string} id - ID của loại phòng
 */
const deleteRoomType = (id) => {
    return api.delete(`/admin/room-types/${id}`);
};


// =============================================
// == QUẢN LÝ PHÒNG (ROOM MANAGEMENT) ==
// =============================================

/**
 * [Admin/Employee] Lấy TẤT CẢ các phòng
 */
const getAllRooms = () => {
    return api.get('/admin/rooms');
};

/**
 * [Admin/Employee] Tạo một phòng mới
 * @param {object} roomData - Dữ liệu phòng (e.g., { roomNumber, roomTypeId, status })
 */
const createRoom = (roomData) => {
    return api.post('/admin/rooms', roomData);
};

/**
 * [Admin/Employee] Cập nhật thông tin một phòng
 * @param {string} id - ID của phòng
 * @param {object} roomData - Dữ liệu cần cập nhật
 */
const updateRoom = (id, roomData) => {
    return api.put(`/admin/rooms/${id}`, roomData);
};

/**
 * [Admin/Employee] Xóa một phòng
 * @param {string} id - ID của phòng
 */
const deleteRoom = (id) => {
    return api.delete(`/admin/rooms/${id}`);
};


// Gán tất cả các hàm vào một đối tượng có tên
const adminApiService = {
    getAllBookings,
    updateBookingStatus,
    getAllCustomers,
    updateUser,
    getAllRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    getAllRooms,
    createRoom,
    updateRoom,
    deleteRoom
};

export default adminApiService;