import React, { useState, useEffect, useMemo } from "react";
import { FaUsers, FaSearch } from "react-icons/fa";
import api from "../../services/api";
import toast from "react-hot-toast";

// --- COMPONENT CHÍNH ---
const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/customers");
      const formattedCustomers = res.data.map((c) => ({
        ...c,
        user: c.user || {},
      }));
      setCustomers(formattedCustomers);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách khách hàng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // HÀM MỚI: Thay đổi trạng thái Active/Banned
  const handleToggleStatus = async (customer) => {
    const newStatus = customer.user.status === "Active" ? "InActive" : "Active";
    const actionText =
      newStatus === "InActive" ? "vô hiệu hóa" : "kích hoạt lại";

    if (!window.confirm(`Bạn có chắc muốn ${actionText} tài khoản này?`)) {
      return;
    }

    const promise = api.put(`/admin/users/${customer.user.id}`, {
      status: newStatus,
    });

    toast.promise(promise, {
      loading: "Đang cập nhật...",
      success: (res) => {
        // Cập nhật lại state ngay lập tức để UI thay đổi
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customer.id
              ? { ...c, user: { ...c.user, status: newStatus } }
              : c
          )
        );
        return `Đã ${actionText} tài khoản!`;
      },
      error: `Không thể ${actionText} tài khoản.`,
    });
  };

  const handleUpdateSuccess = (updatedUserData) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.user.id === updatedUserData.id ? { ...c, user: updatedUserData } : c
      )
    );
    setIsEditModalOpen(false);
  };

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (customer) =>
          `${customer.user.firstName || ""} ${customer.user.lastName || ""}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (customer.user.email || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      ),
    [customers, searchTerm]
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center text-gray-800">
          <FaUsers className="mr-3" /> Quản lý Khách hàng
        </h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ngày tham gia
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 font-semibold whitespace-no-wrap">{`${customer.user.lastName} ${customer.user.firstName}`}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {customer.user.email}
                    </p>
                    <p className="text-gray-600 whitespace-no-wrap">
                      {customer.user.phone}
                    </p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-center">
                    <StatusBadge status={customer.user.status} />
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {new Date(
                        customer.user.created_at.replace(" ", "T")
                      ).toLocaleDateString("vi-VN")}
                    </p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-center">
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 font-semibold mr-4"
                    >
                      Sửa
                    </button>
                    {/* NÚT THAY ĐỔI TRẠNG THÁI */}
                    <button
                      onClick={() => handleToggleStatus(customer)}
                      className={`font-semibold ${
                        customer.user.status === "Active"
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {customer.user.status === "Active"
                        ? "Vô hiệu hóa"
                        : "Kích hoạt"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && (
        <EditCustomerModal
          customer={selectedCustomer}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

// --- CÁC COMPONENT CON ---
const StatusBadge = ({ status }) => {
  const statusMap = {
    Active: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Banned: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${
        statusMap[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

const EditCustomerModal = ({ customer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: customer.user.firstName || "",
    lastName: customer.user.lastName || "",
    phone: customer.user.phone || "",
    // Để modal này chỉ sửa thông tin, không sửa trạng thái
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.phone.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin trước khi lưu!");
      return; 
    }
    setIsSaving(true);
    try {
      const res = await api.put(`/admin/users/${customer.user.id}`, formData);
      toast.success("Cập nhật thông tin thành công!");
      onSuccess(res.data);
    } catch (error) {
      toast.error("Cập nhật thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          Chỉnh sửa thông tin khách hàng
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Họ
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tên
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerManagement;
