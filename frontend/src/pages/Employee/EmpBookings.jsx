import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaBook, FaSearch, FaFilter, FaUsers, FaCalendarAlt, FaHotel, FaMoneyBillWave, FaUser } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const formatDate = (date) => format(new Date(date), 'yyyy-MM-dd');

// --- COMPONENT CHÍNH ---
const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '', customerName: '',
        startDate: '', endDate: ''
    });
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = useCallback(async (currentFilters) => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/bookings', { params: currentFilters });
            setBookings(res.data);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách đặt phòng.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings(filters);
    }, [fetchBookings, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleQuickFilter = (period) => {
        const today = new Date();
        let start, end;
        if (period === 'week') {
            start = startOfWeek(today);
            end = endOfWeek(today);
        } else if (period === 'month') {
            start = startOfMonth(today);
            end = endOfMonth(today);
        } else if (period === 'year') {
            start = startOfYear(today);
            end = endOfYear(today);
        }
        setFilters(prev => ({ ...prev, startDate: formatDate(start), endDate: formatDate(end) }));
    };

    const clearFilters = () => {
        setFilters({ status: '', customerName: '', startDate: '', endDate: '' });
    };

    const handleUpdateStatus = (bookingId, newStatus) => {
        const actionText = {
            Confirmed: "Xác nhận",
            CheckedIn: "Check-in",
            Completed: "Hoàn thành",
            Cancelled: "Hủy đơn"
        };
        const promise = api.put(`/admin/bookings/${bookingId}/status`, { status: newStatus });
        toast.promise(promise, {
            loading: 'Đang cập nhật...',
            success: (res) => {
                // Tải lại dữ liệu sau khi cập nhật
                fetchBookings(filters);
                setSelectedBooking(res.data); // Cập nhật booking trong modal
                return `${actionText[newStatus] || 'Cập nhật'} thành công!`;
            },
            error: `Lỗi khi ${actionText[newStatus] || 'cập nhật'}.`,
        });
    };

    const filteredBookings = useMemo(() => {
        // Lọc phía client sau khi đã lấy dữ liệu từ server (nếu cần)
        return bookings;
    }, [bookings]);

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6"><FaBook className="inline-block mr-3" />Quản lý Đặt phòng</h1>
            
            <FilterBar 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                onQuickFilter={handleQuickFilter}
                onClearFilters={clearFilters}
                onApply={() => fetchBookings(filters)}
            />

            <div className="bg-white shadow-md rounded-lg overflow-x-auto mt-6">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="th-admin">Khách hàng</th>
                            <th className="th-admin">Lưu trú</th>
                            <th className="th-admin">Loại phòng</th>
                            <th className="th-admin text-right">Tổng tiền</th>
                            <th className="th-admin text-center">Trạng thái</th>
                            <th className="th-admin text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (<tr><td colSpan="6" className="text-center p-6 text-gray-500">Đang tải...</td></tr>) 
                        : filteredBookings.length > 0 ? (
                            filteredBookings.map(booking => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="td-admin">{`${booking.customer.user.firstName} ${booking.customer.user.lastName}`}</td>
                                    <td className="td-admin">{`${formatDate(booking.checkInDate)} → ${formatDate(booking.checkOutDate)}`}</td>
                                    <td className="td-admin">{booking.items[0]?.room.roomType.name}</td>
                                    <td className="td-admin text-right font-semibold">{new Intl.NumberFormat('vi-VN').format(booking.totalAmount)}đ</td>
                                    <td className="td-admin text-center"><StatusBadge status={booking.status} /></td>
                                    <td className="td-admin text-center">
                                        <button onClick={() => setSelectedBooking(booking)} className="text-blue-600 font-semibold hover:underline">Xem & Cập nhật</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="text-center p-6 text-gray-500">Không tìm thấy đơn đặt phòng nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedBooking && (
                <BookingDetailModal 
                    booking={selectedBooking} 
                    onClose={() => setSelectedBooking(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
        </div>
    );
};

// --- CÁC COMPONENT CON ---
const control = "h-10 px-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 w-full";

const FilterBar = ({ filters, onFilterChange, onQuickFilter, onClearFilters, onApply }) => (
  <div className="p-4 bg-white rounded-lg shadow-sm grid grid-cols-12 gap-4">

    {/* Tìm kiếm (3) */}
    <div className="col-span-12 md:col-span-3 grid gap-1 min-w-[220px]">
      <label className="text-xs font-semibold text-gray-500">Tìm kiếm</label>
      <div className="relative">
        <input
          type="text"
          name="customerName"
          value={filters.customerName}
          onChange={onFilterChange}
          placeholder="Tên hoặc email khách..."
          className={`${control} pl-10`}
        />
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
    </div>

    {/* Trạng thái (2) */}
    <div className="col-span-12 md:col-span-2 grid gap-1 min-w-[170px]">
      <label className="text-xs font-semibold text-gray-500">Trạng thái</label>
      <select name="status" value={filters.status} onChange={onFilterChange} className={control}>
        <option value="">Tất cả</option>
        <option value="Pending">Chờ xác nhận</option>
        <option value="Confirmed">Đã xác nhận</option>
        <option value="CheckedIn">Đã nhận phòng</option>
        <option value="Completed">Đã hoàn thành</option>
        <option value="Cancelled">Đã hủy</option>
      </select>
    </div>

    {/* Từ ngày (2) */}
    <div className="col-span-12 md:col-span-2 grid gap-1 min-w-[160px]">
      <label className="text-xs font-semibold text-gray-500">Ngày nhận phòng</label>
      <input type="date" name="startDate" value={filters.startDate} onChange={onFilterChange} className={control} />
    </div>

    {/* Đến ngày (2) */}
    <div className="col-span-12 md:col-span-2 grid gap-1 min-w-[160px]">
      <label className="text-xs font-semibold text-gray-500 opacity-0">Đến ngày</label>
      <input type="date" name="endDate" value={filters.endDate} onChange={onFilterChange} className={control} />
    </div>

    {/* Hành động (3) */}
    <div className="col-span-12 md:col-span-3 grid grid-rows-[auto,auto]">
      <span className="text-xs font-semibold text-gray-500 opacity-0">Hành động</span>
      <div className="flex md:justify-end items-center gap-2 md:flex-nowrap flex-wrap">
        <button onClick={() => onQuickFilter('week')}  className="h-10 px-3 btn-filter">Tuần</button>
        <button onClick={() => onQuickFilter('month')} className="h-10 px-3 btn-filter">Tháng</button>
        <button onClick={onClearFilters}               className="h-10 px-3 btn-filter-clear">Xóa</button>
        <button onClick={() => onApply()}              className="h-10 px-3 btn-primary flex items-center gap-2">
          <FaFilter/> Lọc
        </button>
      </div>
    </div>
  </div>
);


const StatusBadge = ({ status }) => {
    const statusMap = {
        Pending: 'bg-yellow-100 text-yellow-800', Confirmed: 'bg-blue-100 text-blue-800',
        CheckedIn: 'bg-indigo-100 text-indigo-800', Completed: 'bg-green-100 text-green-800',
        Cancelled: 'bg-red-100 text-red-800',
    };
    return <span className={`px-3 py-1 font-semibold leading-tight rounded-full text-xs ${statusMap[status]}`}>{status}</span>;
};

const BookingDetailModal = ({ booking, onClose, onUpdateStatus }) => {
    const { customer, items, checkInDate, checkOutDate, totalAmount, totalGuests, status } = booking;
    const user = customer.user;
    const roomType = items[0]?.room.roomType;

    const ActionButtons = () => {
        switch (status) {
            case 'Pending':
                return <button onClick={() => onUpdateStatus(booking.id, 'Confirmed')} className="btn-confirm">Xác nhận Đặt phòng</button>;
            case 'Confirmed':
                return <button onClick={() => onUpdateStatus(booking.id, 'CheckedIn')} className="btn-confirm">Xác nhận Nhận phòng</button>;
            case 'CheckedIn':
                return <button onClick={() => onUpdateStatus(booking.id, 'Completed')} className="btn-confirm">Xác nhận Trả phòng</button>;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl animate-fade-in-up">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold">Chi tiết Đặt phòng #{booking.id}</h2>
                    <StatusBadge status={status} />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Thông tin Khách hàng</h3>
                        <p><FaUser className="inline mr-2" /> {`${user.firstName} ${user.lastName}`}</p>
                        <p>{user.email} - {user.phone}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Thông tin Phòng</h3>
                        <p><FaHotel className="inline mr-2" /> {roomType?.name}</p>
                        <p><FaUsers className="inline mr-2" /> {totalGuests} khách</p>
                    </div>
                    <div className="col-span-2">
                         <h3 className="font-bold text-lg mb-2">Thông tin Lưu trú</h3>
                        <p><FaCalendarAlt className="inline mr-2" /> {`${formatDate(checkInDate)} đến ${formatDate(checkOutDate)}`}</p>
                        <p><FaMoneyBillWave className="inline mr-2" /> Tổng cộng: <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(totalAmount)}đ</span></p>
                    </div>
                </div>

                <div className="mt-6 border-t pt-4 flex justify-end items-center gap-3">
                    <button onClick={onClose} className="btn-secondary">Đóng</button>
                    {status !== 'Cancelled' && status !== 'Completed' && (
                        <button onClick={() => onUpdateStatus(booking.id, 'Cancelled')} className="btn-danger">Hủy Đơn</button>
                    )}
                    <ActionButtons />
                </div>
            </div>
        </div>
    );
};

export default BookingManagement;