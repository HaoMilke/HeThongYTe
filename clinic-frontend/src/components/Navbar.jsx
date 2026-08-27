import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Stethoscope, 
  Sparkles, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Calendar, 
  LayoutDashboard,
  ChevronDown,
  PhoneCall,
  MapPin,
  ShieldCheck,
  Search,
  Activity,
  Users,
  Pill,
  Clock
} from 'lucide-react';

export const Navbar = ({ onOpenAiModal }) => {
  const { user, isAuthenticated, logout, theme, toggleTheme, isPatient, isDoctor, isReceptionist, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (isAdmin) return { text: 'Quản trị Admin', class: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' };
    if (isDoctor) return { text: 'Bác sĩ Chuyên khoa', class: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' };
    if (isReceptionist) return { text: 'Quầy Lễ Tân', class: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' };
    return { text: 'Bệnh nhân', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' };
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isDoctor) return '/doctor/dashboard';
    if (isReceptionist) return '/receptionist/dashboard';
    return '/patient/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
      
      {/* 1. TOP EMERGENCY & INFO BAR (MEDLATEC STYLE) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <PhoneCall className="w-3.5 h-3.5" /> Hotline Cấp Cứu 24/7: 1900 8888
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Số 123 Đường Y Học, Cầu Giấy, Hà Nội
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Tiêu chuẩn Y Tế ISO 9001:2015
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <button onClick={onOpenAiModal} className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Trợ lý AI Chẩn đoán
            </button>
            <span>|</span>
            <Link to="/book" className="text-emerald-400 hover:underline">
              Đặt lịch khám nhanh
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group text-decoration-none">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl text-blue-600 dark:text-blue-400 block leading-tight">
              MediClinic
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Hệ Thống Y Tế Quốc Tế
            </span>
          </div>
        </Link>

        {/* Center Main Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold">
          <Link 
            to="/" 
            className={`transition-colors ${location.pathname === '/' ? 'text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'}`}
          >
            Trang Chủ
          </Link>

          <Link 
            to="/book" 
            className={`flex items-center gap-1.5 transition-colors ${location.pathname === '/book' ? 'text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'}`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            Đặt Lịch Khám
          </Link>

          <button 
            onClick={onOpenAiModal} 
            className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-700 font-bold transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Trợ Lý AI
          </button>

          {isAuthenticated && (
            <Link 
              to={getDashboardPath()} 
              className={`flex items-center gap-1.5 font-bold transition-colors ${location.pathname.includes('/dashboard') || location.pathname.includes('/patient') || location.pathname.includes('/doctor') || location.pathname.includes('/receptionist') || location.pathname.includes('/admin') ? 'text-blue-600' : 'text-slate-700 dark:text-slate-200 hover:text-blue-600'}`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              Phân Hệ Làm Việc
            </Link>
          )}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Đổi Giao diện Sáng/Tối"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Profile / Auth Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 pr-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[120px] truncate">
                    {user?.fullName || user?.username}
                  </span>
                  <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-bold ${getRoleLabel().class}`}>
                    {getRoleLabel().text}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-2 z-50 animate-fade-in"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] text-slate-400 font-semibold">Tài khoản đang đăng nhập</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user?.username}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      Vào phân hệ làm việc
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất tài khoản
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="btn-secondary text-xs py-2 px-4 h-9 font-bold"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="btn-primary text-xs py-2 px-4 h-9 font-bold hidden sm:inline-flex"
              >
                Đăng ký
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};

export default Navbar;
