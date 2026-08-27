import api from "./api";

export const medicalService = {
  // =====================================================
  // MEDICAL RECORD
  // =====================================================

  createMedicalRecord: (data) => {
    return api.post(
      "/api/medical-records",
      data
    );
  },

  getRecordById: (id) => {
    return api.get(
      `/api/medical-records/${id}`
    );
  },

  getRecordByAppointment: (
    appointmentId
  ) => {
    return api.get(
      `/api/medical-records/appointment/${appointmentId}`
    );
  },

  getRecordsByPatient: (
    patientId
  ) => {
    return api.get(
      `/api/medical-records/patient/${patientId}`
    );
  },

  getRecordsByDoctor: (
    doctorId
  ) => {
    return api.get(
      `/api/medical-records/doctor/${doctorId}`
    );
  },

  getAllRecords: () => {
    return api.get(
      "/api/medical-records"
    );
  },

  updateMedicalRecord: (
    id,
    data
  ) => {
    return api.put(
      `/api/medical-records/${id}`,
      data
    );
  },

  // =====================================================
  // VITAL SIGNS
  //
  // Backend KHÔNG có:
  // /vital-signs/appointment/{id}
  // /vital-signs/patient/{id}
  //
  // Backend dùng medicalRecordId.
  // =====================================================

  createVitalSign: (data) => {
    return api.post(
      "/api/vital-signs",
      data
    );
  },

  getVitalSignById: (id) => {
    return api.get(
      `/api/vital-signs/${id}`
    );
  },

  getVitalSignsByMedicalRecord: (
    medicalRecordId
  ) => {
    return api.get(
      `/api/vital-signs/medical-record/${medicalRecordId}`
    );
  },

  updateVitalSign: (
    id,
    data
  ) => {
    return api.put(
      `/api/vital-signs/${id}`,
      data
    );
  },
};

export default medicalService;
