import React from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export const RoleRoute = ({
  children,
  allowedRoles = [],
}) => {
  const {
    isAuthenticated,
    roles,
    loading,
  } = useAuth();

  const location = useLocation();

  // =====================================================
  // ĐANG KIỂM TRA SESSION
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <span className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />

          <span>
            Đang kiểm tra quyền truy cập...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // CHƯA LOGIN
  // =====================================================
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // =====================================================
  // KIỂM TRA ROLE
  // =====================================================
  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0
  ) {
    const currentRoles =
      Array.isArray(roles)
        ? roles
        : [];

    const hasPermission =
      allowedRoles.some((role) =>
        currentRoles.includes(role)
      );

    if (!hasPermission) {
      return (
        <Navigate
          to="/403"
          replace
        />
      );
    }
  }

  return children;
};

export default RoleRoute;
