import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { appointmentService } from "../services/appointmentService";

import DashboardLayout from "../layouts/DashboardLayout";

import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";

import {
  UserCheck,
  Clock,
  CheckCircle2,
  Play,
  Calendar,
  Activity,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

// =====================================================
// HELPERS
// =====================================================

const formatDateTime = (value) => {
  if (!value) {
    return "---";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "---";
  }

  return date.toLocaleString(
    "vi-VN"
  );
};

const isSameLocalDate = (
  dateValue,
  targetDate = new Date()
) => {
  if (!dateValue) {
    return false;
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return false;
  }

  return (
    date.getFullYear() ===
      targetDate.getFullYear() &&
    date.getMonth() ===
      targetDate.getMonth() &&
    date.getDate() ===
      targetDate.getDate()
  );
};

const getActionForStatus = (
  status
) => {
  switch (status) {
    case "WAITING":
      return {
        type: "START",
        label: "Bắt Đầu Khám",
      };

    case "EXAMINING":
      return {
        type: "CONTINUE",
        label: "Tiếp Tục Khám",
      };

    case "PENDING":
      return {
        type: "INFO",
        label: "Chờ xác nhận",
      };

    case "CONFIRMED":
      return {
        type: "INFO",
        label: "Chờ check-in",
      };

    case "CHECKED_IN":
      return {
        type: "INFO",
        label: "Chờ vào hàng đợi",
      };

    case "COMPLETED":
      return {
        type: "DONE",
        label: "Đã khám xong",
      };

    case "CANCELLED":
      return {
        type: "DISABLED",
        label: "Đã hủy",
      };

    case "NO_SHOW":
      return {
        type: "DISABLED",
        label: "Không đến",
      };

    default:
      return {
        type: "DISABLED",
        label: "---",
      };
  }
};

export const DoctorDashboard = () => {
  const navigate =
    useNavigate();

  // ===================================================
  // AUTH
  //
  // doctorId = doctorProfile.id THẬT.
  // KHÔNG dùng user.id.
  // ===================================================

  const {
    user,
    doctorId,
    doctorProfile,
  } = useAuth();

  // ===================================================
  // STATE
  // ===================================================

  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    filterStatus,
    setFilterStatus,
  ] = useState("ALL");

  const [
    startingExamId,
    setStartingExamId,
  ] = useState(null);

  // ===================================================
  // LOAD APPOINTMENTS
  // ===================================================

  const fetchDoctorData =
    useCallback(
      async () => {
        if (!doctorId) {
          setAppointments(
            []
          );

          setError(
            "Tài khoản này chưa được liên kết với hồ sơ bác sĩ."
          );

          setLoading(
            false
          );

          return;
        }

        setLoading(true);
        setError("");

        try {
          /*
           * Chỉ lấy lịch của đúng doctorId.
           *
           * TUYỆT ĐỐI KHÔNG:
           *
           * getAppointmentsByDoctor(...)
           *   .catch(() => getAllAppointments())
           */
          const response =
            await appointmentService
              .getAppointmentsByDoctor(
                doctorId
              );

          const data =
            Array.isArray(
              response
            )
              ? response
              : [];

          /*
           * Dashboard bác sĩ chỉ hiển thị
           * lịch khám hôm nay.
           */
          const todayData =
            data
              .filter(
                (
                  appointment
                ) =>
                  isSameLocalDate(
                    appointment
                      .appointmentTime
                  )
              )
              .sort(
                (a, b) =>
                  new Date(
                    a.appointmentTime
                  ) -
                  new Date(
                    b.appointmentTime
                  )
              );

          setAppointments(
            todayData
          );
        } catch (err) {
          console.error(
            "Load doctor appointments failed:",
            err
          );

          setAppointments(
            []
          );

          setError(
            err?.message ||
              "Không thể tải danh sách lịch khám của bác sĩ."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [doctorId]
    );

  useEffect(() => {
    fetchDoctorData();
  }, [fetchDoctorData]);

  // ===================================================
  // START / CONTINUE EXAM
  // ===================================================

  const handleExamAction =
    async (
      appointment
    ) => {
      if (
        !appointment?.id
      ) {
        return;
      }

      setError("");

      // -----------------------------------------------
      // WAITING -> EXAMINING
      // -----------------------------------------------

      if (
        appointment.status ===
        "WAITING"
      ) {
        setStartingExamId(
          appointment.id
        );

        try {
          /*
           * Backend chỉ cho:
           *
           * WAITING
           *   ↓
           * EXAMINING
           */
          await appointmentService
            .startExam(
              appointment.id
            );

          /*
           * CHỈ navigate khi backend
           * startExam thành công.
           */
          navigate(
            `/doctor/examination/${appointment.id}`
          );
        } catch (err) {
          console.error(
            "Start exam failed:",
            err
          );

          setError(
            err?.message ||
              "Không thể bắt đầu ca khám."
          );

          /*
           * Backend fail thì dừng.
           * Không mở phòng khám giả.
           */
          return;
        } finally {
          setStartingExamId(
            null
          );
        }

        return;
      }

      // -----------------------------------------------
      // EXAMINING
      //
      // Appointment đã được start trước đó,
      // không gọi startExam lần hai.
      // -----------------------------------------------

      if (
        appointment.status ===
        "EXAMINING"
      ) {
        navigate(
          `/doctor/examination/${appointment.id}`
        );
      }
    };

  // ===================================================
  // FILTER
  // ===================================================

  const filteredAppointments =
    useMemo(() => {
      if (
        filterStatus ===
        "ALL"
      ) {
        return appointments;
      }

      return appointments.filter(
        (appointment) =>
          appointment.status ===
          filterStatus
      );
    }, [
      appointments,
      filterStatus,
    ]);

  // ===================================================
  // STATS
  // ===================================================

  const waitingCount =
    appointments.filter(
      (appointment) =>
        appointment.status ===
          "WAITING" ||
        appointment.status ===
          "CHECKED_IN"
    ).length;

  const examiningCount =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "EXAMINING"
    ).length;

  const completedCount =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "COMPLETED"
    ).length;

  // ===================================================
  // RENDER ACTION
  // ===================================================

  const renderExamAction = (
    appointment
  ) => {
    const action =
      getActionForStatus(
        appointment.status
      );

    // -----------------------------------------------
    // START
    // -----------------------------------------------

    if (
      action.type ===
      "START"
    ) {
      const starting =
        startingExamId ===
        appointment.id;

      return (
        <button
          type="button"
          disabled={
            starting
          }
          onClick={() =>
            handleExamAction(
              appointment
            )
          }
          className="btn-primary text-xs h-9 py-0 px-3 flex items-center gap-1.5 ml-auto disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {starting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}

          <span>
            {starting
              ? "Đang bắt đầu..."
              : action.label}
          </span>
        </button>
      );
    }

    // -----------------------------------------------
    // CONTINUE
    // -----------------------------------------------

    if (
      action.type ===
      "CONTINUE"
    ) {
      return (
        <button
          type="button"
          onClick={() =>
            handleExamAction(
              appointment
            )
          }
          className="btn-primary text-xs h-9 py-0 px-3 flex items-center gap-1.5 ml-auto"
        >
          <ArrowRight className="w-3.5 h-3.5" />

          <span>
            {
              action.label
            }
          </span>
        </button>
      );
    }

    // -----------------------------------------------
    // DONE
    // -----------------------------------------------

    if (
      action.type ===
      "DONE"
    ) {
      return (
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 justify-end">
          <CheckCircle2 className="w-4 h-4" />

          {
            action.label
          }
        </span>
      );
    }

    // -----------------------------------------------
    // WAITING FOR RECEPTIONIST
    // -----------------------------------------------

    if (
      action.type ===
      "INFO"
    ) {
      return (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          {
            action.label
          }
        </span>
      );
    }

    return (
      <span className="text-xs text-slate-400">
        {
          action.label
        }
      </span>
    );
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <DashboardLayout>
      {/* ============================================= */}
      {/* HEADER */}
      {/* ============================================= */}

      <PageHeader
        title={`Bàn Khám Bệnh - ${
          doctorProfile?.fullName ||
          user?.fullName ||
          "Bác sĩ"
        }`}
        description={
          doctorId
            ? `Mã bác sĩ: DOC-${doctorId} | Quản lý danh sách ca khám hôm nay`
            : "Tài khoản chưa được liên kết với hồ sơ bác sĩ"
        }
        action={
          doctorId ? (
            <div className="flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 py-2.5 px-4 rounded-xl font-bold border border-blue-200 dark:border-blue-800">
              <UserCheck className="w-4 h-4" />

              Đang hoạt động
            </div>
          ) : null
        }
      />

      {/* ============================================= */}
      {/* ERROR */}
      {/* ============================================= */}

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

          <div className="flex-1">
            <p>
              {error}
            </p>

            {doctorId && (
              <button
                type="button"
                onClick={
                  fetchDoctorData
                }
                className="mt-2 text-xs font-bold underline"
              >
                Thử tải lại
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* NO DOCTOR PROFILE */}
      {/* ============================================= */}

      {!loading &&
      !doctorId ? (
        <EmptyState
          title="Chưa có hồ sơ bác sĩ"
          message="Tài khoản đã đăng nhập nhưng chưa được liên kết với hồ sơ bác sĩ. Vui lòng liên hệ quản trị viên."
        />
      ) : (
        <>
          {/* ========================================= */}
          {/* STATS */}
          {/* ========================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="saas-card flex items-center justify-between">
              <div className="space-y-1">
                <span className="small-text font-semibold uppercase tracking-wider">
                  Tổng Lịch Hôm Nay
                </span>

                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {
                    appointments.length
                  }
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="saas-card flex items-center justify-between">
              <div className="space-y-1">
                <span className="small-text font-semibold uppercase tracking-wider">
                  Đang Chờ Khám
                </span>

                <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                  {
                    waitingCount
                  }
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="saas-card flex items-center justify-between">
              <div className="space-y-1">
                <span className="small-text font-semibold uppercase tracking-wider">
                  Đang Khám
                </span>

                <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                  {
                    examiningCount
                  }
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="saas-card flex items-center justify-between">
              <div className="space-y-1">
                <span className="small-text font-semibold uppercase tracking-wider">
                  Đã Hoàn Thành
                </span>

                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {
                    completedCount
                  }
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* FILTER */}
          {/* ========================================= */}

          <div className="saas-card mb-6 flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
              <span className="text-slate-500">
                Lọc ca khám:
              </span>

              {[
                {
                  id: "ALL",
                  label:
                    "Tất cả",
                },
                {
                  id:
                    "PENDING",
                  label:
                    "Chờ xác nhận",
                },
                {
                  id:
                    "CONFIRMED",
                  label:
                    "Đã xác nhận",
                },
                {
                  id:
                    "CHECKED_IN",
                  label:
                    "Đã Check-in",
                },
                {
                  id:
                    "WAITING",
                  label:
                    "Đang chờ",
                },
                {
                  id:
                    "EXAMINING",
                  label:
                    "Đang khám",
                },
                {
                  id:
                    "COMPLETED",
                  label:
                    "Hoàn thành",
                },
              ].map(
                (item) => (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      setFilterStatus(
                        item.id
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      filterStatus ===
                      item.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {
                      item.label
                    }
                  </button>
                )
              )}
            </div>

            <span className="small-text">
              Số lượng ca khám:{" "}

              <strong className="text-slate-800 dark:text-slate-200">
                {
                  filteredAppointments.length
                }
              </strong>
            </span>
          </div>

          {/* ========================================= */}
          {/* TABLE */}
          {/* ========================================= */}

          {loading ? (
            <LoadingSkeleton.TableSkeleton
              rows={5}
            />
          ) : filteredAppointments.length ===
            0 ? (
            <EmptyState
              title="Không có ca khám nào"
              message="Không tìm thấy lịch khám phù hợp trong ngày hôm nay."
            />
          ) : (
            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>
                      STT / Mã Hẹn
                    </th>

                    <th>
                      Bệnh Nhân
                    </th>

                    <th>
                      Khung Giờ Hẹn
                    </th>

                    <th>
                      Lý Do Khám
                    </th>

                    <th>
                      Trạng Thái
                    </th>

                    <th className="text-right">
                      Khám Bệnh
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map(
                    (
                      appointment,
                      index
                    ) => (
                      <tr
                        key={
                          appointment.id
                        }
                      >
                        <td className="font-mono font-bold">
                          #
                          {
                            index +
                            1
                          }{" "}
                          (APP-
                          {
                            appointment.id
                          }
                          )
                        </td>

                        <td className="font-bold text-slate-900 dark:text-white">
                          {appointment.patientName ||
                            `Bệnh nhân #${appointment.patientId}`}
                        </td>

                        <td className="small-text">
                          {formatDateTime(
                            appointment.appointmentTime
                          )}
                        </td>

                        <td className="small-text max-w-xs truncate">
                          {appointment.reason ||
                            "---"}
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              appointment.status
                            }
                          />
                        </td>

                        <td className="text-right">
                          {renderExamAction(
                            appointment
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default DoctorDashboard;
