import api from './api';

export const prescriptionService = {
  createPrescription: (data) => api.post('/api/prescriptions', data),
  getPrescriptionById: (id) => api.get(`/api/prescriptions/${id}`),
  getByMedicalRecordId: (medicalRecordId) => api.get(`/api/prescriptions/medical-record/${medicalRecordId}`),
  getByPatientId: (patientId) => api.get(`/api/prescriptions/patient/${patientId}`),
  getByDoctorId: (doctorId) => api.get(`/api/prescriptions/doctor/${doctorId}`),
  getAllPrescriptions: () => api.get('/api/prescriptions'),

  // Medicines
  getAllMedicines: () => api.get('/api/medicines'),
  getMedicineById: (id) => api.get(`/api/medicines/${id}`),
  createMedicine: (data) => api.post('/api/medicines', data),
  updateMedicine: (id, data) => api.put(`/api/medicines/${id}`, data),
  deactivateMedicine: (id) => api.patch(`/api/medicines/${id}/deactivate`),
  updateMedicineStock: (id, quantity) => api.patch(`/api/medicines/${id}/stock`, null, { params: { quantity } }),
};

export default prescriptionService;
