import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  LayoutDashboard,
  Calendar,
  Pill,
  CreditCard,
  Sparkles,
  Clock,
  Users,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { isDoctor, isReceptionist, isAdmin } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    if (isAdmin) {
      return [
        {
          path: '/admin/dashboard',
          label: 'Tổng Quan Hệ Thống',
          icon: LayoutDashboard,
        },
        {
          path: '/admin/doctors',
          label: 'Quản Lý Bác Sĩ',
          icon: Stethoscope,
        },
        {
          path: '/admin/specialties',
          label: 'Chuyên Khoa',
          icon: Users,
        },
        {
          path: '/admin/medicines',
          label: 'Kho Thuốc & Bảng Giá',
          icon: Pill,
        },
        {
          path: '/admin/users',
          label: 'Phân Quyền User',
          icon: ShieldCheck,
        },
      ];
    }

    if (isDoctor) {
      return [
        {
          path: '/doctor/dashboard',
          label: 'Bàn Khám Bệnh',
          icon: LayoutDashboard,
        },
        {
          path: '/doctor/appointments',
          label: 'Danh Sách Ca Khám',
          icon: Calendar,
        },
        {
          path: '/doctor/schedule',
          label: 'Lịch Làm Việc',
          icon: Clock,
        },
      ];
    }

    if (isReceptionist) {
      return [
        {
          path: '/receptionist/dashboard',
          label: 'Quầy Tiếp Đón',
          icon: LayoutDashboard,
        },
        {
          path: '/receptionist/appointments',
          label: 'Hàng Chờ Check-in',
          icon: Clock,
        },
        {
          path: '/receptionist/payments',
          label: 'Thu Phí Dịch Vụ',
          icon: CreditCard,
        },
      ];
    }

    // Mặc định là Patient
    return [
      {
        path: '/patient/dashboard',
        label: 'Tổng Quan Bệnh Nhân',
        icon: LayoutDashboard,
      },
      {
        path: '/patient/book',
        label: 'Đặt Lịch Khám Mới',
        icon: Calendar,
      },
      {
        path: '/patient/ai-consultation',
        label: 'Trợ Lý AI Tư Vấn',
        icon: Sparkles,
      },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Menu riêng theo vai trò */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-blue-600'
                    }`}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nội dung trang Dashboard */}
      <div className="w-full page-container animate-fade-in py-8">
        {children}
      </div>
    </>
  );
};

export default DashboardLayout;