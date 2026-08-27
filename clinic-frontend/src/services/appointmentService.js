import api from "./api";

export const appointmentService = {
  // =====================================================
  // CREATE
  // =====================================================

  createAppointment: (data) => {
    return api.post(
      "/api/appointments",
      data
    );
  },

  // =====================================================
  // GET
  // =====================================================

  getAppointmentById: (id) => {
    return api.get(
      `/api/appointments/${id}`
    );
  },

  getAppointmentsByPatient: (patientId) => {
    return api.get(
      `/api/appointments/patient/${patientId}`
    );
  },

  getAppointmentsByDoctor: (doctorId) => {
    return api.get(
      `/api/appointments/doctor/${doctorId}`
    );
  },

  getAllAppointments: () => {
    return api.get(
      "/api/appointments"
    );
  },

  getDoctorAppointmentsByDate: (
    doctorId,
    date
  ) => {
    return api.get(
      `/api/appointments/doctor/${doctorId}/date/${date}`
    );
  },

  // =====================================================
  // SLOT
  //
  // Backend response:
  //
  // {
  //   doctorId,
  //   appointmentTime,
  //   available: true/false
  // }
  // =====================================================

  checkAvailableSlot: (
    doctorId,
    appointmentTime
  ) => {
    return api.get(
      "/api/appointments/available-slots",
      {
        params: {
          doctorId,
          appointmentTime,
        },
      }
    );
  },

  // =====================================================
  // STATUS
  // =====================================================

  confirmAppointment: (id) => {
    return api.patch(
      `/api/appointments/${id}/confirm`
    );
  },

  checkInAppointment: (id) => {
    return api.patch(
      `/api/appointments/${id}/check-in`
    );
  },

  markWaiting: (id) => {
    return api.patch(
      `/api/appointments/${id}/waiting`
    );
  },

  startExam: (id) => {
    return api.patch(
      `/api/appointments/${id}/start-exam`
    );
  },

  completeAppointment: (id) => {
    return api.patch(
      `/api/appointments/${id}/complete`
    );
  },

  cancelAppointment: (id) => {
    return api.patch(
      `/api/appointments/${id}/cancel`
    );
  },

  markNoShow: (id) => {
    return api.patch(
      `/api/appointments/${id}/no-show`
    );
  },

  // =====================================================
  // RESCHEDULE
  // =====================================================

  rescheduleAppointment: (
    id,
    appointmentTime
  ) => {
    return api.patch(
      `/api/appointments/${id}/reschedule`,
      null,
      {
        params: {
          appointmentTime,
        },
      }
    );
  },
};

export default appointmentService;
