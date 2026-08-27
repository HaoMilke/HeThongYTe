import api from "./api";

export const authService = {
  // =========================
  // PUBLIC AUTH
  // =========================

  login: (data) => {
    return api.post(
      "/api/auth/login",
      data
    );
  },

  register: (data) => {
    return api.post(
      "/api/auth/register",
      data
    );
  },

  refresh: (refreshToken) => {
    return api.post(
      "/api/auth/refresh",
      {
        refreshToken,
      }
    );
  },

  logout: (refreshToken) => {
    return api.post(
      "/api/auth/logout",
      {
        refreshToken,
      }
    );
  },

  // =========================
  // CURRENT USER
  // =========================

  getMe: () => {
    return api.get(
      "/api/auth/me"
    );
  },

  changePassword: (data) => {
    return api.patch(
      "/api/auth/change-password",
      data
    );
  },

  // =========================
  // ADMIN USER MANAGEMENT
  // =========================

  getAllUsers: () => {
    return api.get(
      "/api/auth/users"
    );
  },

  getUserById: (id) => {
    return api.get(
      `/api/auth/users/${id}`
    );
  },

  setUserEnabled: (
    id,
    enabled
  ) => {
    return api.patch(
      `/api/auth/users/${id}/enabled?enabled=${enabled}`
    );
  },

  addRole: (
    userId,
    roleName
  ) => {
    return api.post(
      `/api/auth/users/${userId}/roles/${roleName}`
    );
  },

  removeRole: (
    userId,
    roleName
  ) => {
    return api.delete(
      `/api/auth/users/${userId}/roles/${roleName}`
    );
  },

  resetPassword: (
    userId,
    newPassword
  ) => {
    return api.patch(
      `/api/auth/users/${userId}/reset-password`,
      {
        newPassword,
      }
    );
  },
};

export default authService;
