export const APPOINTMENT_STATUSES = {
  PENDING: { label: 'Chờ xác nhận', badgeClass: 'badge-warning' },
  CREATED: { label: 'Chờ xác nhận', badgeClass: 'badge-warning' },
  CONFIRMED: { label: 'Đã xác nhận', badgeClass: 'badge-purple' },
  CHECKED_IN: { label: 'Đã Check-in', badgeClass: 'badge-info' },
  WAITING: { label: 'Đang chờ khám', badgeClass: 'badge-info' },
  EXAMINING: { label: 'Đang khám', badgeClass: 'badge-purple' },
  IN_PROGRESS: { label: 'Đang khám', badgeClass: 'badge-purple' },
  COMPLETED: { label: 'Hoàn thành', badgeClass: 'badge-success' },
  CANCELLED: { label: 'Đã hủy', badgeClass: 'badge-danger' },
  NO_SHOW: { label: 'Vắng mặt', badgeClass: 'badge-danger' },
};

export const getStatusConfig = (status) => {
  return APPOINTMENT_STATUSES[status] || { label: status || 'Khác', badgeClass: 'badge-info' };
};
