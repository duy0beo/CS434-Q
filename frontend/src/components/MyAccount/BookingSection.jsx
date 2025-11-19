// src/components/MyAccount/BookingSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    FaSuitcase,
    FaCalendar,
    FaReceipt,
    FaTrash,
    FaChevronDown,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaConciergeBell,
    FaUserFriends,
    FaBed,
    FaTag,
    FaEnvelope,
    FaPhone,
} from "react-icons/fa";
import api from "../../services/api";
import toast from "react-hot-toast";

/** Helpers */
const absoluteFromApi = (p = "") => (api?.defaults?.baseURL || "").replace(/\/api\/?$/, "") + p;
const toDay = (x) => {
    const d = new Date(x);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
const today = (() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
})();

/** Component chính */
const BookingSection = ({ bookings: initialBookings, onBookingUpdate }) => {
    const [bookings, setBookings] = useState(initialBookings);
    const [activeFilter, setActiveFilter] = useState("upcoming");
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);

    useEffect(() => {
        setBookings(initialBookings);
    }, [initialBookings]);

    const isConfirmed = (b) => b.status === "Confirmed";
    const isCancelledOrDone = (b) => ["Cancelled", "Completed"].includes(b.status);

    // Phân nhóm theo NGÀY để không trùng tab
    const ongoing = useMemo(
        () => bookings.filter((b) => isConfirmed(b) && toDay(b.checkInDate) <= today && toDay(b.checkOutDate) >= today),
        [bookings]
    );
    const upcoming = useMemo(
        () => bookings.filter((b) => isConfirmed(b) && toDay(b.checkInDate) > today),
        [bookings]
    );
    const past = useMemo(
        () => bookings.filter((b) => toDay(b.checkOutDate) < today || isCancelledOrDone(b)),
        [bookings]
    );

    // Chọn tab mặc định thông minh
    useEffect(() => {
        if (ongoing.length > 0) setActiveFilter("ongoing");
        else if (upcoming.length > 0) setActiveFilter("upcoming");
        else setActiveFilter("past");
    }, [ongoing.length, upcoming.length, past.length]);

    const list = activeFilter === "upcoming" ? upcoming : activeFilter === "ongoing" ? ongoing : past;

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return;
        setIsLoading(true);
        try {
            await api.delete(`/bookings/${bookingToCancel.id}`);
            toast.success("Hủy đơn thành công!");
            setBookings((prev) => prev.map((b) => (b.id === bookingToCancel.id ? { ...b, status: "Cancelled" } : b)));
            onBookingUpdate?.();
        } catch {
            toast.error("Có lỗi xảy ra khi hủy đơn.");
        } finally {
            setIsLoading(false);
            setShowCancelModal(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!bookingToDelete) return;
        setIsLoading(true);
        try {
            await api.patch(`/bookings/${bookingToDelete.id}/hide`);
            toast.success("Đã xóa khỏi lịch sử!");
            setBookings((prev) => prev.filter((b) => b.id !== bookingToDelete.id));
            onBookingUpdate?.();
        } catch {
            toast.error("Có lỗi xảy ra khi xóa.");
        } finally {
            setIsLoading(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <section className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="flex items-center text-2xl font-semibold text-gray-900 shrink-0">
                    <FaSuitcase className="mr-3 text-blue-500" />
                    Đơn đặt phòng
                </h2>
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-full">
                    <FilterButton label="Sắp tới" count={upcoming.length} isActive={activeFilter === "upcoming"} onClick={() => setActiveFilter("upcoming")} />
                    <FilterButton label="Đang sử dụng" count={ongoing.length} isActive={activeFilter === "ongoing"} onClick={() => setActiveFilter("ongoing")} />
                    <FilterButton label="Đã qua" count={past.length} isActive={activeFilter === "past"} onClick={() => setActiveFilter("past")} />
                </div>
            </div>

            <div className="space-y-6">
                {list.length > 0 ? (
                    list.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            activeFilter={activeFilter}
                            onCancel={() => {
                                setBookingToCancel(booking);
                                setShowCancelModal(true);
                            }}
                            onDelete={() => {
                                setBookingToDelete(booking);
                                setShowDeleteModal(true);
                            }}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
                        <FaSuitcase className="mx-auto text-4xl text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800">Chưa có đơn đặt phòng nào</h3>
                        <p className="text-gray-500">Các đơn đặt phòng của bạn sẽ xuất hiện ở đây.</p>
                    </div>
                )}
            </div>

            {showCancelModal && (
                <CancelModal booking={bookingToCancel} onClose={() => setShowCancelModal(false)} onConfirm={handleConfirmCancel} isLoading={isLoading} />
            )}
            {showDeleteModal && (
                <DeleteModal onClose={() => setShowDeleteModal(false)} onConfirm={handleConfirmDelete} isLoading={isLoading} />
            )}
        </section>
    );
};

/** Subcomponents */
const FilterButton = ({ label, count, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${isActive ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-white"}`}
    >
        {label}
        <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${isActive ? "bg-blue-400 text-white" : "bg-gray-200 text-gray-700"}`}>{count}</span>
    </button>
);

const SmartStatusBadge = ({ booking }) => {
    if (booking.status === "Cancelled") return <StatusBadge text="Đã hủy" icon={FaTimesCircle} color="text-red-600 bg-red-100" />;
    if (toDay(booking.checkOutDate) < today || booking.status === "Completed") return <StatusBadge text="Hoàn thành" icon={FaCheckCircle} color="text-green-600 bg-green-100" />;
    if (toDay(booking.checkInDate) <= today && toDay(booking.checkOutDate) >= today) return <StatusBadge text="Đang sử dụng" icon={FaConciergeBell} color="text-purple-600 bg-purple-100" />;
    if (toDay(booking.checkInDate) > today) return <StatusBadge text="Sắp tới" icon={FaClock} color="text-blue-600 bg-blue-100" />;
    return <StatusBadge text={booking.status} icon={FaClock} color="text-yellow-600 bg-yellow-100" />;
};

const StatusBadge = ({ text, icon: Icon, color }) => (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${color}`}>
        <Icon className="mr-1.5" />
        {text}
    </span>
);

// ====================================================================
// == Component 1: BookingDetailsInline (Hiển thị chi tiết)          ==
// ====================================================================
const BookingDetailsInline = ({ booking }) => {
    const nights = Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24));
    const userInfo = booking?.customer?.user;
    const roomTypeInfo = booking.items?.[0]?.room?.roomType;

    return (
        <div className="bg-gray-50 px-5 py-4 border-t-2 border-dashed border-gray-200">
            <h4 className="font-bold text-lg text-gray-800 mb-4">Chi tiết đơn đặt phòng</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Thông tin lưu trú</h5>
                    <div className="space-y-3 text-sm">
                        <DetailItem icon={FaUserFriends} label="Số khách" value={`${booking.totalGuests} người`} />
                        <DetailItem icon={FaBed} label="Phòng số" value={booking.items?.[0]?.room?.roomNumber || 'N/A'} />
                        <DetailItem icon={FaTag} label="Giá mỗi đêm" value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(roomTypeInfo.basePrice)} />
                        <p className="flex justify-between items-center font-bold pt-2 border-t mt-2">
                           <span>Tổng cộng ({nights} đêm):</span>
                           <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount)}</span>
                        </p>
                    </div>
                </div>
                <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Thông tin người đặt</h5>
                    {userInfo ? (
                         <div className="space-y-3 text-sm">
                            <DetailItem icon={FaUserFriends} label="Họ tên" value={`${userInfo.first_name} ${userInfo.last_name}`} />
                            <DetailItem icon={FaEnvelope} label="Email" value={userInfo.email} />
                            <DetailItem icon={FaPhone} label="Điện thoại" value={userInfo.phone} />
                        </div>
                    ) : <p>Không có thông tin.</p>}
                </div>
            </div>
        </div>
    );
};


// ====================================================================
// == Component 2: DetailItem (Component phụ cho chi tiết)           ==
// ====================================================================
const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center text-gray-600">
        <Icon className="text-gray-400 mr-3 w-4 text-center" />
        <span className="font-medium mr-2">{label}:</span>
        <span className="text-gray-800">{value}</span>
    </div>
);


// ====================================================================
// == Component 3: BookingCard (Component chính) ==
// ====================================================================
const BookingCard = ({ booking, activeFilter, onCancel, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const roomInfo = booking.items?.[0]?.room?.roomType;
    const roomName = roomInfo?.name || "Thông tin phòng không có sẵn";
    const roomImage = roomInfo?.photoUrl ? absoluteFromApi(roomInfo.photoUrl) : "https://via.placeholder.com/150";

    return (
        // Thẻ div chính của card. Ta sẽ không dùng overflow-hidden ở đây nữa.
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col md:flex-row">
                {/* SỬA ĐỔI CHÍNH: Bỏ div cha có overflow-hidden.
                  Thay vào đó, ta bo tròn góc trực tiếp trên thẻ <img>.
                  - rounded-t-lg: Bo tròn góc trên khi ở màn hình nhỏ.
                  - md:rounded-l-lg: Bo tròn góc trái khi ở màn hình vừa và lớn.
                  - md:rounded-tr-none: Bỏ bo tròn góc trên-phải ở màn hình lớn.
                */}
                <img 
                    src={roomImage} 
                    alt={roomName} 
                    className="w-full md:w-48 h-48 md:h-auto object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none" 
                />
                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-xl text-gray-800">{roomName}</h3>
                        <SmartStatusBadge booking={booking} />
                    </div>
                    <div className="mt-2 text-gray-600 space-y-2">
                        <p className="flex items-center text-sm">
                            <FaCalendar className="mr-2 text-gray-400" />
                            {new Date(booking.checkInDate).toLocaleDateString("vi-VN")} - {new Date(booking.checkOutDate).toLocaleDateString("vi-VN")}
                        </p>
                        <p className="flex items-center text-sm">
                            <FaReceipt className="mr-2 text-gray-400" />
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(booking.totalAmount)}
                        </p>
                    </div>
                    
                    {/* Phần nút Hành động bây giờ sẽ hoạt động đúng */}
                    <div className="mt-auto pt-4 text-right">
                        <div className="relative inline-block">
                            <button onClick={() => setIsMenuOpen((p) => !p)} className="flex items-center text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md">
                                Hành động <FaChevronDown className="ml-2 text-xs" />
                            </button>
                            {isMenuOpen && (
                                <div onMouseLeave={() => setIsMenuOpen(false)} className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                                    <ul className="py-1">
                                        <li>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsExpanded(p => !p);
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                            </button>
                                        </li>
                                        {activeFilter === "upcoming" && (
                                            <li><button onClick={() => { onCancel(); setIsMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Hủy đơn</button></li>
                                        )}
                                        {activeFilter === "past" && (
                                            <li><button onClick={() => { onDelete(); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaTrash className="mr-2" /> Xóa khỏi lịch sử</button></li>
                                        )}
                                        {(activeFilter === 'ongoing' || activeFilter === 'past') && (
                                            <li><button className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Yêu cầu hỗ trợ</button></li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {isExpanded && <BookingDetailsInline booking={booking} />}
        </div>
    );
};

const ModalShell = ({ title, subtitle, children, actions }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg text-center shadow-xl w-full max-w-sm m-4">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
            {children}
            <div className="flex justify-center gap-4 mt-6">{actions}</div>
        </div>
    </div>
);

const CancelModal = ({ booking, onClose, onConfirm, isLoading }) => (
    <ModalShell
        title="Bạn chắc chắn muốn hủy đơn này?"
        subtitle="Hành động này không thể hoàn tác."
        children={
            <div className="bg-gray-100 p-4 rounded-md text-left">
                {booking && <strong className="block text-gray-800">{booking.items?.[0]?.room?.roomType?.name}</strong>}
                {booking && <span className="text-sm text-gray-500">Nhận phòng: {new Date(booking.checkInDate).toLocaleDateString("vi-VN")}</span>}
            </div>
        }
        actions={
            <>
                <button onClick={onClose} disabled={isLoading} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">Quay lại</button>
                <button onClick={onConfirm} disabled={isLoading} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{isLoading ? "Đang xử lý..." : "Xác nhận hủy"}</button>
            </>
        }
    />
);

const DeleteModal = ({ onClose, onConfirm, isLoading }) => (
    <ModalShell
        title="Xóa khỏi Lịch sử?"
        subtitle="Đơn đặt phòng này sẽ bị ẩn khỏi danh sách của bạn."
        actions={
            <>
                <button onClick={onClose} disabled={isLoading} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">
                    Quay lại
                </button>
                <button onClick={onConfirm} disabled={isLoading} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
                    {isLoading ? "Đang xử lý..." : "Vâng, xác nhận"}
                </button>
            </>
        }
    />
);

export default BookingSection;
