// src/pages/Account/SecuritySection.jsx
import React, { useMemo, useState } from "react";
import {
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaInfoCircle,
} from "react-icons/fa";
import api from "../../services/api";
import toast from "react-hot-toast";

const SecuritySection = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // --- Password rules ---
  const rules = useMemo(
    () => [
      { key: "length", label: "Tối thiểu 8 ký tự", test: (p) => p.length >= 8 },
      {
        key: "upper",
        label: "Có chữ HOA (A–Z)",
        test: (p) => /[A-Z]/.test(p),
      },
      {
        key: "lower",
        label: "Có chữ thường (a–z)",
        test: (p) => /[a-z]/.test(p),
      },
      { key: "digit", label: "Có số (0–9)", test: (p) => /\d/.test(p) },
      {
        key: "special",
        label: "Có ký tự đặc biệt (!@#$...)",
        test: (p) => /[^A-Za-z0-9]/.test(p),
      },
    ],
    []
  );

  const passedCount = rules.filter((r) => r.test(form.newPassword)).length;
  const strength = useMemo(() => {
    // score 0..5
    const score = passedCount;
    if (form.newPassword.length === 0) return { score: 0, label: "Trống" };
    if (score <= 2) return { score, label: "Yếu" };
    if (score === 3) return { score, label: "Trung bình" };
    if (score === 4) return { score, label: "Khá" };
    return { score, label: "Mạnh" };
  }, [passedCount, form.newPassword.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      toast.error("Mật khẩu mới không được trùng mật khẩu hiện tại.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp.");
      return;
    }
    if (passedCount < 3) {
      toast.error("Mật khẩu mới chưa đủ mạnh (ít nhất đạt mức 'Trung bình').");
      return;
    }

    setSubmitting(true);
    const t = toast.loading("Đang đổi mật khẩu...");
    try {
      // Backend: đổi cho endpoint của bạn nếu khác
      await api.put("/users/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!", { id: t });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Không thể đổi mật khẩu. Vui lòng thử lại.";
      toast.error(msg, { id: t });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <h2 className="flex items-center text-2xl font-semibold text-gray-900 mb-6">
        <FaShieldAlt className="mr-3 text-blue-500" /> Bảo mật
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        {/* Current */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              type={show.current ? "text" : "password"}
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(e) =>
                setForm((s) => ({ ...s, currentPassword: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 pr-10 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label={show.current ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {show.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* New */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={show.next ? "text" : "password"}
              autoComplete="new-password"
              value={form.newPassword}
              onChange={(e) =>
                setForm((s) => ({ ...s, newPassword: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 pr-10 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="Ít nhất 8 ký tự, gồm chữ HOA/thường, số, ký tự đặc biệt"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label={show.next ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {show.next ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Strength meter */}
          <div className="mt-2">
            <div className="h-2 w-full bg-gray-200 rounded">
              <div
                className={`h-2 rounded transition-all ${
                  strength.score <= 2
                    ? "bg-red-400"
                    : strength.score === 3
                    ? "bg-yellow-400"
                    : strength.score === 4
                    ? "bg-green-400"
                    : "bg-emerald-500"
                }`}
                style={{
                  width: `${(strength.score / 5) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <FaInfoCircle className="mr-2" />
              <span>Mức độ: {strength.label}</span>
            </div>

            {/* Rules list */}
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
              {rules.map((r) => {
                const ok = r.test(form.newPassword);
                return (
                  <li
                    key={r.key}
                    className={`flex items-center ${
                      ok ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    <FaKey className={`mr-2 ${ok ? "opacity-100" : "opacity-60"}`} />
                    {r.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Confirm */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={show.confirm ? "text" : "password"}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((s) => ({ ...s, confirmPassword: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 pr-10 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="Nhập lại mật khẩu mới"
              required
            />
            <button
              type="button"
              onClick={() =>
                setShow((s) => ({ ...s, confirm: !s.confirm }))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label={show.confirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {show.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {submitting ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
          <span className="text-xs text-gray-500">
            Sau khi đổi, bạn có thể sẽ cần đăng nhập lại.
          </span>
        </div>
      </form>
    </section>
  );
};

export default SecuritySection;
