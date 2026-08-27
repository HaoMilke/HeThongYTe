import React from 'react';
import { CalendarX } from 'lucide-react';

export const EmptyState = ({ 
  icon: Icon = CalendarX, 
  title = 'Chưa có dữ liệu', 
  message = 'Không có thông tin nào được tìm thấy.', 
  action 
}) => {
  return (
    <div className="saas-card text-center py-12 px-6 flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h3 className="card-title text-slate-800 dark:text-slate-200">{title}</h3>
        <p className="body-text text-slate-500 max-w-sm mt-1">{message}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
