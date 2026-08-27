import React from 'react';

const statusMap = {
  PENDING: { label: 'Chờ xác nhận', badgeClass: 'badge-warning' },
  CREATED: { label: 'Mới tạo', badgeClass: 'badge-warning' },
  CONFIRMED: { label: 'Đã xác nhận', badgeClass: 'badge-info' },
  CHECKED_IN: { label: 'Đã Check-in', badgeClass: 'badge-purple' },
  WAITING: { label: 'Đang chờ khám', badgeClass: 'badge-warning' },
  EXAMINING: { label: 'Đang khám', badgeClass: 'badge-cyan' },
  IN_PROGRESS: { label: 'Đang khám', badgeClass: 'badge-cyan' },
  COMPLETED: { label: 'Hoàn thành', badgeClass: 'badge-success' },
  CANCELLED: { label: 'Đã hủy', badgeClass: 'badge-danger' },
  NO_SHOW: { label: 'Vắng mặt', badgeClass: 'badge-gray' },
  
  // Payment status
  UNPAID: { label: 'Chưa thanh toán', badgeClass: 'badge-warning' },
  PAID: { label: 'Đã thanh toán', badgeClass: 'badge-success' },
  REFUNDED: { label: 'Đã hoàn tiền', badgeClass: 'badge-purple' },
};

export const StatusBadge = ({ status }) => {
  const config = statusMap[status] || { label: status || 'Khác', badgeClass: 'badge-gray' };
  return (
    <span className={`badge ${config.badgeClass}`}>
      ● {config.label}
    </span>
  );
};

export default StatusBadge;
