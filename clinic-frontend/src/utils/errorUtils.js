export const getErrorMessage = (error) => {
  if (!error) return 'Có lỗi xảy ra không xác định';
  
  if (typeof error === 'string') return error;

  const status = error.response?.status;
  const serverMsg = error.response?.data?.message || error.response?.data;

  if (typeof serverMsg === 'string' && serverMsg.trim() !== '') {
    return serverMsg;
  }

  switch (status) {
    case 400:
      return 'Dữ liệu yêu cầu không hợp lệ. Vui lòng kiểm tra lại.';
    case 401:
      return 'Phiên đăng nhập hết hạn hoặc chưa được xác thực. Vui lòng đăng nhập lại.';
    case 403:
      return 'Bạn không có quyền thực hiện thao tác này.';
    case 404:
      return 'Không tìm thấy dữ liệu yêu cầu.';
    case 500:
      return 'Có lỗi hệ thống xảy ra. Vui lòng thử lại sau.';
    default:
      return error.message || 'Có lỗi khi kết nối với máy chủ API Gateway.';
  }
};
