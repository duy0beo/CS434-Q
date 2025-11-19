// file: src/pages/Admin/EmployeeManagement.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaUserShield, FaSearch, FaPlus } from "react-icons/fa";
import api from "../../services/api";
import toast from "react-hot-toast";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Chỉ dùng cho modal "Thêm mới"

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/employees");
      setEmployees(res.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách nhân viên.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleToggleStatus = (employee) => {
    const newStatus = employee.status === "Active" ? "Inactive" : "Active";
    const actionText = newStatus === "Active" ? "Kích hoạt" : "Vô hiệu hóa";
    if (
      !window.confirm(
        `Bạn có chắc muốn ${actionText} tài khoản ${employee.firstName}?`
      )
    )
      return;

    const promise = api.put(`/admin/users/${employee.id}`, {
      status: newStatus,
    });
    toast.promise(promise, {
      loading: `Đang ${actionText}...`,
      success: () => {
        fetchEmployees(); // Tải lại danh sách để có dữ liệu mới nhất
        return `${actionText} thành công!`;
      },
      error: `Lỗi khi ${actionText}.`,
    });
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchEmployees();
  };

  const filteredEmployees = useMemo(
    () =>
      employees.filter(
        (emp) =>
          `${emp.firstName || ""} ${emp.lastName || ""}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (emp.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [employees, searchTerm]
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          <FaUserShield className="inline-block mr-3" />
          Quản lý Nhân viên
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-72"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Thêm Nhân viên
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Nhân viên
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Liên hệ
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">
                Ngày tham gia
              </th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase">
                Trạng thái & Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center p-6 text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b text-sm">{`${employee.lastName} ${employee.firstName}`}</td>
                  <td className="px-5 py-4 border-b text-sm">
                    <p>{employee.email}</p>
                    <p className="text-gray-600">{employee.phone}</p>
                  </td>
                  <td className="px-5 py-4 border-b text-sm">
                    {new Date(employee.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-5 py-4 border-b text-sm text-center">
                    {/* ✅ SỬA LẠI THÀNH NÚT BẤM DUY NHẤT */}
                    {employee.status === "Active" ? (
                      <button
                        onClick={() => handleToggleStatus(employee)}
                        className="px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200"
                      >
                        Vô hiệu hóa
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(employee)}
                        className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-full hover:bg-green-200"
                      >
                        Kích hoạt
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <EmployeeModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

// Component Modal chỉ dùng cho việc "Thêm mới"
const EmployeeModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);

    const apiPromise = api.post("/admin/employees", formData);

    const wrappedPromise = apiPromise
      .then((res) => res)
      .catch((err) => {
        const errorMessage = err.response?.data?.message || "Có lỗi xảy ra.";
        return Promise.reject(errorMessage);
      });

    return toast
      .promise(wrappedPromise, {
        loading: "Đang thêm nhân viên...",
        success: () => {
          onSuccess();
          return `Thêm nhân viên thành công!`;
        },
        error: (errorMessage) => errorMessage,
      })
      .catch(() => {})
      .finally(() => setIsSaving(false));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Thêm nhân viên mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Họ</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tên</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md p-2"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Mật khẩu</label>
            <input
              type="password"
              name="password"
              required
              minLength="8"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
            >
              {isSaving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeManagement;
