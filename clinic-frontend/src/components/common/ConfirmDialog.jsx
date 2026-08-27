import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title = 'Xác nhận thao tác',
  message = 'Bạn có chắc chắn muốn thực hiện thao tác này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container p-6 space-y-4 max-w-md animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${isDanger ? 'text-rose-500' : 'text-amber-500'}`} />
            <h3 className="card-title">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="body-text">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={onCancel} className="btn-secondary text-xs h-10 py-0 px-4">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${isDanger ? 'btn-danger' : 'btn-primary'} text-xs h-10 py-0 px-4`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
