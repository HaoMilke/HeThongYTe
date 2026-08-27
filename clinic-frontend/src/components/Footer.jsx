import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  MapPin, 
  PhoneCall, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Heart,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Footer = ({ onOpenAiModal }) => {
  return (
    <footer className="bg-white/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800/80 mt-16 pt-16 pb-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-200/60 dark:border-slate-800/60">
          
          {/* COL 1: BRAND */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group text-decoration-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-xl bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  MediClinic
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  Healthcare System
                </span>
              </div>
            </Link>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống phòng khám đa khoa quốc tế kết nối Microservices Spring Boot & Trợ lý AI Chẩn đoán thông minh Python FastAPI.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Chứng nhận Bộ Y Tế & Tiêu chuẩn ISO 9001</span>
            </div>
          </div>

          {/* COL 2: QUICK NAVIGATION */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              Danh Mục Truy Cập
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" /> Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" /> Đặt lịch khám trực tuyến
                </Link>
              </li>
              <li>
                <button 
                  onClick={onOpenAiModal}
                  className="hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1.5 transition-colors text-purple-600 dark:text-purple-400 font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Trợ lý AI Chẩn đoán triệu chứng
                </button>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" /> Đăng nhập hệ thống
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 3: SPECIALTIES */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              Chuyên Khoa Nổi Bật
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-center gap-2">● Tai Mũi Họng</li>
              <li className="flex items-center gap-2">● Tim Mạch & Huyết Áp</li>
              <li className="flex items-center gap-2">● Nội Tổng Quát</li>
              <li className="flex items-center gap-2">● Nhi Khoa</li>
              <li className="flex items-center gap-2">● Nhãn Khoa (Mắt)</li>
              <li className="flex items-center gap-2">● Da Liễu & Thẩm Mỹ</li>
            </ul>
          </div>

          {/* COL 4: CONTACT & HOURS */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              Liên Hệ & Giờ Làm Việc
            </h4>
            
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Số 123 Đường Y Học, Phường Dịch Vọng, Cầu Giấy, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Hotline: 1900 8888 (24/7)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>contact@mediclinic.vn</span>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-slate-800 dark:text-slate-200">T2 - T7: 07:30 - 20:00</span>
                  <span className="block text-slate-500">Chủ Nhật: 08:00 - 17:00</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 MediClinic Healthcare System. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-1 font-semibold">
            <span>Thiết kế hệ thống Microservices & Frontend React</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
