import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({ message = 'Có lỗi xảy ra khi kết nối máy chủ', onRetry }) => {
  return (
    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary text-xs py-1.5 px-3 h-8 flex items-center gap-1 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Thử lại
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
