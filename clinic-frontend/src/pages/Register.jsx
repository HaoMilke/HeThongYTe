import React, { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  UserPlus,
  User,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

export const Register = () => {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [formData, setFormData] =
    useState({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // INPUT CHANGE
  // =====================================================
  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =====================================================
  // VALIDATION
  // =====================================================
  const validateForm = () => {
    const fullName =
      formData.fullName.trim();

    const email =
      formData.email.trim();

    const phone =
      formData.phone.trim();

    if (!fullName) {
      return "Vui lòng nhập họ và tên.";
    }

    if (fullName.length < 2) {
      return "Họ và tên không hợp lệ.";
    }

    if (!email) {
      return "Vui lòng nhập email.";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Email không đúng định dạng.";
    }

    if (!phone) {
      return "Vui lòng nhập số điện thoại.";
    }

    const normalizedPhone =
      phone.replace(/\s/g, "");

    const phoneRegex =
      /^(0|\+84)[0-9]{9,10}$/;

    if (
      !phoneRegex.test(
        normalizedPhone
      )
    ) {
      return "Số điện thoại không hợp lệ.";
    }

    if (!formData.password) {
      return "Vui lòng nhập mật khẩu.";
    }

    if (
      formData.password.length < 6
    ) {
      return "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (
      !formData.confirmPassword
    ) {
      return "Vui lòng xác nhận mật khẩu.";
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      return "Mật khẩu xác nhận không khớp.";
    }

    return null;
  };

  // =====================================================
  // REGISTER
  // =====================================================
  const handleRegister = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName:
          formData.fullName.trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),

        phone:
          formData.phone
            .replace(/\s/g, "")
            .trim(),

        password:
          formData.password,
      };

      /*
       * Backend:
       *
       * POST /api/auth/register
       *
       * {
       *   fullName,
       *   email,
       *   phone,
       *   password
       * }
       *
       * Backend tự gán ROLE_PATIENT.
       */
      await register(payload);

      setSuccess(
        "Đăng ký tài khoản thành công. Nếu hồ sơ bệnh nhân chưa được tạo, vui lòng liên hệ lễ tân hoặc quản trị viên trước khi đặt lịch."
      );

      // Không tự login.
      // Chuyển sang màn hình login
      // sau khi backend xác nhận đăng ký thành công.
      setTimeout(() => {
        navigate(
          "/login",
          {
            replace: true,
          }
        );
      }, 1200);
    } catch (err) {
      console.error(
        "Register failed:",
        err
      );

      setError(
        err?.message ||
          "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full saas-card p-8 space-y-6 relative overflow-hidden">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>

          <h1 className="page-title text-2xl">
            Đăng ký tài khoản
          </h1>

          <p className="body-text text-xs max-w-sm mx-auto">
            Tạo tài khoản bệnh nhân để đặt lịch khám,
            theo dõi hồ sơ và quản lý sức khỏe.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

            <span>
              {error}
            </span>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div
            role="status"
            className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />

            <span>
              {success}
            </span>
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleRegister}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* FULL NAME */}
          <div className="sm:col-span-2">
            <label
              htmlFor="fullName"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
            >
              Họ và tên *
            </label>

            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

              <input
                id="fullName"
                type="text"
                name="fullName"
                value={
                  formData.fullName
                }
                onChange={
                  handleChange
                }
                placeholder="Nguyễn Văn An"
                autoComplete="name"
                disabled={loading}
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
            >
              Email *
            </label>

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

              <input
                id="email"
                type="email"
                name="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                placeholder="an@gmail.com"
                autoComplete="email"
                disabled={loading}
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
            >
              Số điện thoại *
            </label>

            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

              <input
                id="phone"
                type="tel"
                name="phone"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                placeholder="0912345678"
                autoComplete="tel"
                disabled={loading}
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
            >
              Mật khẩu *
            </label>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                disabled={loading}
                className="input-field pl-9 pr-10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Ẩn mật khẩu"
                    : "Hiện mật khẩu"
                }
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
            >
              Xác nhận mật khẩu *
            </label>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={
                  formData.confirmPassword
                }
                onChange={
                  handleChange
                }
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                disabled={loading}
                className="input-field pl-9 pr-10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) =>
                      !current
                  )
                }
                disabled={loading}
                aria-label={
                  showConfirmPassword
                    ? "Ẩn mật khẩu xác nhận"
                    : "Hiện mật khẩu xác nhận"
                }
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* NOTICE */}
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sau khi đăng ký, bạn có thể bổ sung ngày sinh,
              giới tính, địa chỉ và thông tin sức khỏe trong
              hồ sơ bệnh nhân.
            </p>
          </div>

          {/* SUBMIT */}
          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />

                  <span>
                    Đang đăng ký...
                  </span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />

                  <span>
                    Đăng ký tài khoản
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* LOGIN LINK */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          Đã có tài khoản?{" "}

          <Link
            to="/login"
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
