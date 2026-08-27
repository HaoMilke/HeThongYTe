import React, { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  Stethoscope,
  Lock,
  Mail,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export const Login = () => {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const { login } = useAuth();

  const navigate = useNavigate();

  // =====================================================
  // REDIRECT THEO ROLE
  // =====================================================
  const redirectByRole = (profile) => {
    const roles = Array.isArray(
      profile?.roles
    )
      ? profile.roles
      : [];

    // Ưu tiên role cao hơn nếu user có nhiều role
    if (roles.includes("ROLE_ADMIN")) {
      navigate(
        "/admin/dashboard",
        { replace: true }
      );

      return;
    }

    if (
      roles.includes(
        "ROLE_RECEPTIONIST"
      )
    ) {
      navigate(
        "/receptionist/dashboard",
        { replace: true }
      );

      return;
    }

    if (
      roles.includes(
        "ROLE_DOCTOR"
      )
    ) {
      navigate(
        "/doctor/dashboard",
        { replace: true }
      );

      return;
    }

    if (
      roles.includes(
        "ROLE_PATIENT"
      )
    ) {
      navigate(
        "/patient/dashboard",
        { replace: true }
      );

      return;
    }

    throw new Error(
      "Tài khoản chưa được cấp quyền truy cập hệ thống."
    );
  };

  // =====================================================
  // LOGIN SUBMIT
  // =====================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const normalizedEmail =
      email.trim();

    if (!normalizedEmail) {
      setError(
        "Vui lòng nhập email."
      );

      return;
    }

    if (!password) {
      setError(
        "Vui lòng nhập mật khẩu."
      );

      return;
    }

    // Kiểm tra email cơ bản phía frontend
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        normalizedEmail
      )
    ) {
      setError(
        "Email không đúng định dạng."
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * AuthContext.login:
       *
       * POST /api/auth/login
       *        ↓
       * save accessToken
       * save refreshToken
       *        ↓
       * GET /api/auth/me
       *        ↓
       * trả profile thật
       */
      const profile =
        await login(
          normalizedEmail,
          password
        );

      redirectByRole(profile);
    } catch (err) {
      console.error(
        "Login failed:",
        err
      );

      setError(
        err?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full saas-card p-8 space-y-6 relative overflow-hidden">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Stethoscope className="w-7 h-7" />
          </div>

          <h1 className="page-title text-2xl">
            Đăng nhập hệ thống
          </h1>

          <p className="body-text text-xs">
            Cổng thông tin quản lý phòng khám MediClinic
          </p>
        </div>

        {/* LOGIN FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
            >
              Email
            </label>

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="example@gmail.com"
                autoComplete="email"
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
              Mật khẩu
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
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
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
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
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

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />

                <span>
                  Đang xác thực...
                </span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />

                <span>
                  Đăng nhập
                </span>
              </>
            )}
          </button>
        </form>

        {/* REGISTER */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          Chưa có tài khoản bệnh nhân?{" "}

          <Link
            to="/register"
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
