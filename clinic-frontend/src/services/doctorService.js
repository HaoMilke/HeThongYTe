import api from "./api";

export const doctorService = {
  // =====================================================
  // DOCTORS
  // =====================================================

  createDoctor: (data) => {
    return api.post(
      "/api/doctors",
      data
    );
  },

  getAllDoctors: () => {
    return api.get(
      "/api/doctors"
    );
  },

  getDoctorById: (id) => {
    return api.get(
      `/api/doctors/${id}`
    );
  },

  // Auth userId -> Doctor profile
  getDoctorByUserId: (userId) => {
    return api.get(
      `/api/doctors/user/${userId}`
    );
  },

  getDoctorsBySpecialization: (
    specialization
  ) => {
    return api.get(
      `/api/doctors/specialization/${encodeURIComponent(
        specialization
      )}`
    );
  },

  getAvailableDoctors: () => {
    return api.get(
      "/api/doctors/available"
    );
  },

  updateDoctor: (id, data) => {
    return api.put(
      `/api/doctors/${id}`,
      data
    );
  },

  // =====================================================
  // SPECIALTIES
  // =====================================================

  getAllSpecialties: () => {
    return api.get(
      "/api/specialties"
    );
  },

  getActiveSpecialties: () => {
    return api.get(
      "/api/specialties/active"
    );
  },

  getSpecialtyById: (id) => {
    return api.get(
      `/api/specialties/${id}`
    );
  },

  createSpecialty: (data) => {
    return api.post(
      "/api/specialties",
      data
    );
  },

  updateSpecialty: (id, data) => {
    return api.put(
      `/api/specialties/${id}`,
      data
    );
  },

  setSpecialtyActive: (
    id,
    active
  ) => {
    return api.patch(
      `/api/specialties/${id}/active?active=${active}`
    );
  },

  assignDoctorToSpecialty: (
    specialtyId,
    doctorId
  ) => {
    return api.patch(
      `/api/specialties/${specialtyId}/doctors/${doctorId}`
    );
  },

  getDoctorsBySpecialty: (
    specialtyId
  ) => {
    return api.get(
      `/api/specialties/${specialtyId}/doctors`
    );
  },

  deleteSpecialty: (id) => {
  return api.delete(
    `/api/specialties/${id}`
  );
},

  // =====================================================
  // DOCTOR SCHEDULE
  // =====================================================

  getDoctorSchedules: (doctorId) => {
    return api.get(
      `/api/doctors/${doctorId}/schedules`
    );
  },

  getActiveDoctorSchedules: (doctorId) => {
    return api.get(
      `/api/doctors/${doctorId}/schedules/active`
    );
  },

  getScheduleByDay: (
    doctorId,
    dayOfWeek
  ) => {
    return api.get(
      `/api/doctors/${doctorId}/schedules/day/${dayOfWeek}`
    );
  },

  createDoctorSchedule: (
  doctorId,
  data
) => {
  return api.post(
    `/api/doctors/${doctorId}/schedules`,
    data
  );
},

updateDoctorSchedule: (
  scheduleId,
  data
) => {
  return api.put(
    `/api/doctors/schedules/${scheduleId}`,
    data
  );
},

setDoctorScheduleActive: (
  scheduleId,
  active
) => {
  return api.patch(
    `/api/doctors/schedules/${scheduleId}/active?active=${active}`
  );
},

deleteDoctorSchedule: (
  scheduleId
) => {
  return api.delete(
    `/api/doctors/schedules/${scheduleId}`
  );
},

};

export default doctorService;
