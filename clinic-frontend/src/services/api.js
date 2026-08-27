import axios from "axios";
import { getErrorMessage } from "../utils/errorUtils";

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

const clearAuthStorage = () => {
  localStorage.removeItem("clinic_access_token");
  localStorage.removeItem("clinic_refresh_token");
  localStorage.removeItem("clinic_user");

  window.dispatchEvent(
    new CustomEvent("clinic:auth-expired")
  );
};

const createSessionExpiredError = () => {
  const sessionError = new Error(
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
  );

  // Giữ status để màn hình gọi API vẫn phân biệt được lỗi xác thực.
  sessionError.status = 401;
  sessionError.data = null;

  return sessionError;
};

const isPublicAuthRequest = (url = "") => {
  return (
    url.includes("/api/auth/login") ||
    url.includes("/api/auth/register") ||
    url.includes("/api/auth/refresh") ||
    url.includes("/api/auth/logout")
  );
};

// ======================================================
// REQUEST INTERCEPTOR
// Tự động gắn JWT vào mọi request cần xác thực
// ======================================================
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem(
      "clinic_access_token"
    );

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// REFRESH TOKEN QUEUE
// Tránh gọi refresh nhiều lần cùng lúc
// ======================================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (
  error,
  accessToken = null
) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(accessToken);
    }
  });

  failedQueue = [];
};

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================
api.interceptors.response.use(
  (response) => {
    return response.data;
  },

  async (error) => {
    const originalRequest = error.config;

    const status =
      error.response?.status;

    const requestUrl =
      originalRequest?.url || "";

    // --------------------------------------------------
    // CHỈ refresh khi:
    // - Backend trả 401
    // - Request chưa retry
    // - Không phải login/register/refresh/logout
    // --------------------------------------------------
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthRequest(requestUrl)
    ) {
      const refreshToken =
        localStorage.getItem(
          "clinic_refresh_token"
        );

      if (!refreshToken) {
        clearAuthStorage();

        return Promise.reject(
          createSessionExpiredError()
        );
      }

      if (isRefreshing) {
        return new Promise(
          (resolve, reject) => {
            failedQueue.push({
              resolve,
              reject,
            });
          }
        ).then((newAccessToken) => {
          originalRequest.headers =
            originalRequest.headers || {};

          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;

          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Dùng axios gốc để tránh interceptor tự lặp
        const refreshResponse =
          await axios.post(
            `${BASE_URL}/api/auth/refresh`,
            {
              refreshToken,
            },
            {
              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );

        const newAccessToken =
          refreshResponse.data?.accessToken;

        const newRefreshToken =
          refreshResponse.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error(
            "Backend không trả access token mới."
          );
        }

        localStorage.setItem(
          "clinic_access_token",
          newAccessToken
        );

        if (newRefreshToken) {
          localStorage.setItem(
            "clinic_refresh_token",
            newRefreshToken
          );
        }

        processQueue(
          null,
          newAccessToken
        );

        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(
          refreshError,
          null
        );

        clearAuthStorage();

        return Promise.reject(
          createSessionExpiredError()
        );
      } finally {
        isRefreshing = false;
      }
    }

    // --------------------------------------------------
    // Các lỗi bình thường
    // Login sai password sẽ xuống đây,
    // KHÔNG được tự tạo tài khoản demo
    // --------------------------------------------------
    const friendlyMessage =
      getErrorMessage(error);

    const friendlyError =
      new Error(friendlyMessage);

    friendlyError.status = status;
    friendlyError.data =
      error.response?.data;

    return Promise.reject(
      friendlyError
    );
  }
);

export default api;
