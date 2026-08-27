import api from "./api";

export const patientService = {
  // =====================================================
  // CREATE
  // Gateway hiện chỉ cho RECEPTIONIST / ADMIN tạo Patient
  // =====================================================
  createPatient: (data) => {
    return api.post(
      "/api/patients",
      data
    );
  },

  // Patient tự tạo hồ sơ của chính mình trong lần đăng nhập đầu tiên.
  // Backend lấy userId từ JWT/X-User-Id, không tin userId do browser gửi lên.
  createCurrentPatient: (data) => {
    return api.post(
      "/api/patients/me",
      data
    );
  },

  // =====================================================
  // CURRENT PATIENT
  // Backend lấy X-User-Id từ Gateway/JWT
  // Frontend KHÔNG cần tự truyền userId
  // =====================================================
  getCurrentPatient: () => {
    return api.get(
      "/api/patients/me"
    );
  },

  // =====================================================
  // GET BY PATIENT ID
  // =====================================================
  getPatientById: (id) => {
    return api.get(
      `/api/patients/${id}`
    );
  },

  // =====================================================
  // AUTH USER ID -> PATIENT PROFILE
  // =====================================================
  getPatientByUserId: (userId) => {
    return api.get(
      `/api/patients/user/${userId}`
    );
  },

  // =====================================================
  // GET ALL
  //
  // Patient-only account:
  // backend tự giới hạn chỉ trả chính Patient đó.
  // =====================================================
  getAllPatients: () => {
    return api.get(
      "/api/patients"
    );
  },

  // =====================================================
  // UPDATE
  // Patient chỉ sửa được hồ sơ của mình.
  // =====================================================
  updatePatient: (id, data) => {
    return api.put(
      `/api/patients/${id}`,
      data
    );
  },
};

export default patientService;
