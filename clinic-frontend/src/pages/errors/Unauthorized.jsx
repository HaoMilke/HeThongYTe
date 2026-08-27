import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 text-center space-y-6 border border-rose-500/20 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-rose-600 dark:text-rose-400">403</h1>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quyền Truy Cập Bị Từ Chối</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tài khoản của bạn không có đặc quyền để truy cập phân hệ làm việc này. Vui lòng liên hệ Quản trị viên hệ thống nếu bạn nghĩ đây là sự nhầm lẫn.
          </p>
        </div>

        <Link to="/" className="btn-primary py-3 px-6 text-xs font-bold w-full inline-flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Quay Về Trang Chủ
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
