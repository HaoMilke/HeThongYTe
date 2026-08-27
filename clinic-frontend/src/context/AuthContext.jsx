import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authService } from "../services/authService";
import { patientService } from "../services/patientService";
import { doctorService } from "../services/doctorService";

const AuthContext =
  createContext(null);

// =====================================================
// STORAGE KEYS
// =====================================================

const ACCESS_TOKEN_KEY =
  "clinic_access_token";

const REFRESH_TOKEN_KEY =
  "clinic_refresh_token";

const USER_KEY =
  "clinic_user";

const THEME_KEY =
  "clinic_theme";

// =====================================================
// CLEAR STORAGE
// =====================================================

const clearStoredAuth = () => {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
};

export const AuthProvider = ({
  children,
}) => {
  // ===================================================
  // AUTH ACCOUNT
  // ===================================================

  const [user, setUser] =
    useState(null);

  const [token, setToken] =
    useState(() => {
      return localStorage.getItem(
        ACCESS_TOKEN_KEY
      );
    });

  // ===================================================
  // BUSINESS PROFILE
  //
  // user.id != patient.id != doctor.id
  // ===================================================

  const [
    patientProfile,
    setPatientProfile,
  ] = useState(null);

  const [
    doctorProfile,
    setDoctorProfile,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  // ===================================================
  // THEME
  // ===================================================

  const [theme, setTheme] =
    useState(() => {
      return (
        localStorage.getItem(
          THEME_KEY
        ) || "light"
      );
    });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      THEME_KEY,
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "light"
        ? "dark"
        : "light"
    );
  };

  // ===================================================
  // CLEAR SESSION
  // ===================================================

  const clearSession = () => {
    clearStoredAuth();

    setToken(null);
    setUser(null);

    setPatientProfile(null);
    setDoctorProfile(null);
  };

  // Đồng bộ state React khi api.js phát hiện refresh token
  // hết hạn và đã xóa thông tin đăng nhập trong localStorage.
  useEffect(() => {
    const handleAuthExpired = () => {
      clearSession();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    };

    window.addEventListener(
      "clinic:auth-expired",
      handleAuthExpired
    );

    return () => {
      window.removeEventListener(
        "clinic:auth-expired",
        handleAuthExpired
      );
    };
  }, []);

  // ===================================================
  // LOAD PATIENT / DOCTOR PROFILE
  // ===================================================

  const loadRoleProfiles =
    async (authUser) => {
      const roles =
        Array.isArray(
          authUser?.roles
        )
          ? authUser.roles
          : [];

      let loadedPatient = null;
      let loadedDoctor = null;

      // -----------------------------------------------
      // PATIENT PROFILE
      //
      // GET /api/patients/me
      //
      // Gateway đọc userId trong JWT
      // và truyền X-User-Id xuống Patient Service.
      // -----------------------------------------------

      if (
        roles.includes(
          "ROLE_PATIENT"
        )
      ) {
        try {
          loadedPatient =
            await patientService
              .getCurrentPatient();
        } catch (error) {
          if (error?.status !== 404) {
            throw error;
          }

          console.warn(
            "Patient profile chưa tồn tại:",
            error?.message
          );

          loadedPatient = null;
        }
      }

      // -----------------------------------------------
      // DOCTOR PROFILE
      //
      // GET /api/doctors/user/{authUser.id}
      // -----------------------------------------------

      if (
        roles.includes(
          "ROLE_DOCTOR"
        )
      ) {
        try {
          loadedDoctor =
            await doctorService
              .getDoctorByUserId(
                authUser.id
              );
        } catch (error) {
          if (error?.status !== 404) {
            throw error;
          }

          console.warn(
            "Doctor profile chưa tồn tại:",
            error?.message
          );

          loadedDoctor = null;
        }
      }

      setPatientProfile(
        loadedPatient
      );

      setDoctorProfile(
        loadedDoctor
      );

      return {
        patientProfile:
          loadedPatient,

        doctorProfile:
          loadedDoctor,
      };
    };

  // ===================================================
  // RESTORE SESSION WHEN F5
  // ===================================================

  useEffect(() => {
    let mounted = true;

    const restoreSession =
      async () => {
        const currentToken =
          localStorage.getItem(
            ACCESS_TOKEN_KEY
          );

        if (!currentToken) {
          if (mounted) {
            setUser(null);
            setToken(null);

            setPatientProfile(
              null
            );

            setDoctorProfile(
              null
            );

            setLoading(false);
          }

          return;
        }

        try {
          // -------------------------------------------
          // GET AUTH PROFILE
          // -------------------------------------------

          const profile =
            await authService.getMe();

          if (!mounted) {
            return;
          }

          setUser(profile);

          localStorage.setItem(
            USER_KEY,
            JSON.stringify(
              profile
            )
          );

          // -------------------------------------------
          // RESOLVE BUSINESS IDS
          // -------------------------------------------

          await loadRoleProfiles(
            profile
          );

          /*
           * api.js có thể vừa refresh access token.
           * Vì vậy đọc lại token mới nhất.
           */
          const latestToken =
            localStorage.getItem(
              ACCESS_TOKEN_KEY
            );

          setToken(
            latestToken
          );
        } catch (error) {
          console.error(
            "Restore session failed:",
            error
          );

          if (mounted) {
            clearSession();
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  // ===================================================
  // LOGIN
  // ===================================================

  const login = async (
    email,
    password
  ) => {
    if (!email?.trim()) {
      throw new Error(
        "Vui lòng nhập email."
      );
    }

    if (!password) {
      throw new Error(
        "Vui lòng nhập mật khẩu."
      );
    }

    // -----------------------------------------------
    // 1. LOGIN BACKEND
    // -----------------------------------------------

    const loginResponse =
      await authService.login({
        email:
          email
            .trim()
            .toLowerCase(),

        password,
      });

    const accessToken =
      loginResponse?.accessToken;

    const refreshToken =
      loginResponse?.refreshToken;

    if (!accessToken) {
      throw new Error(
        "Backend không trả access token."
      );
    }

    if (!refreshToken) {
      throw new Error(
        "Backend không trả refresh token."
      );
    }

    // -----------------------------------------------
    // 2. SAVE TOKENS
    // -----------------------------------------------

    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      accessToken
    );

    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken
    );

    setToken(
      accessToken
    );

    try {
      // ---------------------------------------------
      // 3. LOAD AUTH USER
      // ---------------------------------------------

      const profile =
        await authService.getMe();

      if (!profile) {
        throw new Error(
          "Không lấy được thông tin người dùng."
        );
      }

      setUser(
        profile
      );

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(
          profile
        )
      );

      // ---------------------------------------------
      // 4. LOAD PATIENT / DOCTOR PROFILE
      // ---------------------------------------------

      const businessProfiles =
        await loadRoleProfiles(
          profile
        );

      return {
        ...profile,

        patientProfile:
          businessProfiles
            .patientProfile,

        doctorProfile:
          businessProfiles
            .doctorProfile,
      };
    } catch (error) {
      clearSession();

      throw error;
    }
  };

  // ===================================================
  // REGISTER
  // ===================================================

  const register = async (
    registerData
  ) => {
    if (!registerData) {
      throw new Error(
        "Thông tin đăng ký không hợp lệ."
      );
    }

    return authService.register(
      registerData
    );
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = async () => {
    const refreshToken =
      localStorage.getItem(
        REFRESH_TOKEN_KEY
      );

    /*
     * Xóa browser session trước.
     */
    clearSession();

    if (!refreshToken) {
      return;
    }

    try {
      /*
       * Revoke refresh token backend.
       */
      await authService.logout(
        refreshToken
      );
    } catch (error) {
      console.warn(
        "Backend logout failed:",
        error
      );
    }
  };

  // ===================================================
  // ROLES
  // ===================================================

  const roles =
    Array.isArray(
      user?.roles
    )
      ? user.roles
      : [];

  const hasRole = (
    role
  ) => {
    return roles.includes(
      role
    );
  };

  const isPatient =
    hasRole(
      "ROLE_PATIENT"
    );

  const isDoctor =
    hasRole(
      "ROLE_DOCTOR"
    );

  const isReceptionist =
    hasRole(
      "ROLE_RECEPTIONIST"
    );

  const isAdmin =
    hasRole(
      "ROLE_ADMIN"
    );

  const isAuthenticated =
    Boolean(
      token &&
      user
    );

  // ===================================================
  // REAL IDS
  //
  // KHÔNG BAO GIỜ:
  // user.id || 1
  // ===================================================

  const patientId =
    patientProfile?.id ??
    null;

  const doctorId =
    doctorProfile?.id ??
    null;

  return (
    <AuthContext.Provider
      value={{
        // Auth account
        user,
        token,
        roles,

        // Business profile
        patientProfile,
        doctorProfile,

        // Real IDs
        patientId,
        doctorId,

        // State
        loading,

        // Theme
        theme,
        toggleTheme,

        // Actions
        login,
        register,
        logout,

        clearSession,
        loadRoleProfiles,

        // Security helpers
        hasRole,
        isAuthenticated,

        isPatient,
        isDoctor,
        isReceptionist,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth phải được sử dụng bên trong AuthProvider."
    );
  }

  return context;
};

export default AuthContext;
