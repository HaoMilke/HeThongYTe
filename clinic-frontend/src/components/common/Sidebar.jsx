import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Stethoscope, 
  LayoutDashboard, 
  Calendar, 
  User, 
  FileText, 
  Pill, 
  CreditCard, 
  Sparkles, 
  Clock, 
  Users, 
  ShieldCheck,
  LogOut,
  ChevronRight,
  Search,
  Activity,
  Award
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, isPatient, isDoctor, isReceptionist, isAdmin } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    if (isAdmin) {
      return [
        { path: '/admin/dashboard', label: 'Tổng quan Hệ thống', icon: LayoutDashboard },
        { path: '/admin/doctors', label: 'Quản lý Bác sĩ', icon: Stethoscope },
        { path: '/admin/specialties', label: 'Quản lý Chuyên khoa', icon: Users },
        { path: '/admin/medicines', label: 'Kho Thuốc & Bảng Giá', icon: Pill },
        { path: '/admin/users', label: 'Tài khoản & Phân quyền', icon: ShieldCheck },
      ];
    }

    if (isDoctor) {
      return [
        { path: '/doctor/dashboard', label: 'Bàn Khám Bệnh', icon: LayoutDashboard },
        { path: '/doctor/appointments', label: 'Danh Sách Ca Khám', icon: Calendar },
        { path: '/doctor/schedule', label: 'Lịch Làm Việc', icon: Clock },
        { path: '/doctor/profile', label: 'Hồ Sơ Bác Sĩ', icon: User },
      ];
    }

    if (isReceptionist) {
      return [
        { path: '/receptionist/dashboard', label: 'Quầy Tiếp Đón', icon: LayoutDashboard },
        { path: '/receptionist/appointments', label: 'Check-in Hàng Chờ', icon: Clock },
        { path: '/receptionist/payments', label: 'Thu Phí Dịch Vụ', icon: CreditCard },
      ];
    }

    // Default Patient
    return [
      { path: '/patient/dashboard', label: 'Tổng Quan Cá Nhân', icon: LayoutDashboard },
      { path: '/patient/book', label: 'Đặt Lịch Khám', icon: Calendar },
      { path: '/patient/ai-consultation', label: 'Trợ Lý AI Tư Vấn', icon: Sparkles },
      { path: '/patient/appointments', label: 'Lịch Hẹn Của Tôi', icon: Clock },
      { path: '/patient/medical-records', label: 'Hồ Sơ Bệnh Án', icon: FileText },
      { path: '/patient/prescriptions', label: 'Đơn Thuốc', icon: Pill },
      { path: '/patient/invoices', label: 'Hóa Đơn & Thanh Toán', icon: CreditCard },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      
      {/* Top Logo & Menu */}
      <div className="p-4 space-y-6">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white block leading-tight">
              MediClinic
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Medical SaaS
            </span>
          </div>
        </Link>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              </Link>
            );
          })}
        </nav>

      </div>

      {/* Bottom Profile & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-left overflow-hidden">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {user?.fullName || user?.username}
            </span>
            <span className="block text-[10px] text-slate-400 font-semibold truncate">
              {user?.roles?.[0] || 'ROLE_PATIENT'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
