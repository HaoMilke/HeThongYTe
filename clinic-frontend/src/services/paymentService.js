import api from "./api";

export const paymentService = {
  // =====================================================
  // INVOICES
  // =====================================================

  createInvoice: (data) => {
    return api.post(
      "/api/invoices",
      data
    );
  },

  getInvoiceById: (id) => {
    return api.get(
      `/api/invoices/${id}`
    );
  },

  getInvoiceByAppointment: (
    appointmentId
  ) => {
    return api.get(
      `/api/invoices/appointment/${appointmentId}`
    );
  },

  getInvoicesByPatient: (
    patientId
  ) => {
    return api.get(
      `/api/invoices/patient/${patientId}`
    );
  },

  getAllInvoices: () => {
    return api.get(
      "/api/invoices"
    );
  },

  // Chỉ Receptionist / Admin sử dụng
  markInvoicePaid: (id) => {
    return api.patch(
      `/api/invoices/${id}/pay`
    );
  },

  // Chỉ Receptionist / Admin sử dụng
  cancelInvoice: (id) => {
    return api.patch(
      `/api/invoices/${id}/cancel`
    );
  },

  // =====================================================
  // PAYMENTS
  // =====================================================

  createPayment: (data) => {
    return api.post(
      "/api/payments",
      data
    );
  },

  getPaymentById: (id) => {
    return api.get(
      `/api/payments/${id}`
    );
  },

  getPaymentByAppointment: (
    appointmentId
  ) => {
    return api.get(
      `/api/payments/appointment/${appointmentId}`
    );
  },

  getPaymentsByPatient: (
    patientId
  ) => {
    return api.get(
      `/api/payments/patient/${patientId}`
    );
  },

  getAllPayments: () => {
    return api.get(
      "/api/payments"
    );
  },

  payPayment: (
    paymentId,
    transactionCode
  ) => {
    return api.patch(
      `/api/payments/${paymentId}/pay?transactionCode=${encodeURIComponent(
        transactionCode
      )}`
    );
  },

  // Patient không được refund.
  refundPayment: (paymentId) => {
    return api.patch(
      `/api/payments/${paymentId}/refund`
    );
  },
};

export default paymentService;
