import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 text-center space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
          <FileQuestion className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-amber-600 dark:text-amber-400">404</h1>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Không Tìm Thấy Trang</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Đường dẫn trang web bạn truy cập không tồn tại hoặc đã được di chuyển sang địa chỉ mới.
          </p>
        </div>

        <Link to="/" className="btn-primary py-3 px-6 text-xs font-bold w-full inline-flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Trở Về Trang Chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
