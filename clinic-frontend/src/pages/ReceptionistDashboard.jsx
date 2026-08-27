import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { appointmentService } from "../services/appointmentService";
import { patientService } from "../services/patientService";
import { doctorService } from "../services/doctorService";
import { paymentService } from "../services/paymentService";

import DashboardLayout from "../layouts/DashboardLayout";

import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";

import {
  Search,
  UserCheck,
  CreditCard,
  Plus,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

// =====================================================
// HELPERS
// =====================================================

const pad = (value) =>
  String(value).padStart(2, "0");

const getLocalDateTimeInputValue = (
  date = new Date()
) => {
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
};

const toBackendDateTime = (value) => {
  if (!value) {
    return null;
  }

  return value.length === 16
    ? `${value}:00`
    : value;
};

const isToday = (value) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    date.getFullYear() ===
      today.getFullYear() &&
    date.getMonth() ===
      today.getMonth() &&
    date.getDate() ===
      today.getDate()
  );
};

const formatDateTime = (value) => {
  if (!value) {
    return "---";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "---";
  }

  return date.toLocaleString("vi-VN");
};

const formatMoney = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "---";
  }

  return new Intl.NumberFormat(
    "vi-VN",
    {
      style: "currency",
      currency: "VND",
    }
  ).format(amount);
};

const createInitialWalkInForm = () => ({
  patientId: "",
  doctorId: "",
  appointmentTime:
    getLocalDateTimeInputValue(),
  reason:
    "Khám trực tiếp tại quầy tiếp đón",
});

// =====================================================
// COMPONENT
// =====================================================

export const ReceptionistDashboard =
  () => {
    // =================================================
    // DATA
    // =================================================

    const [
      appointments,
      setAppointments,
    ] = useState([]);

    const [
      invoices,
      setInvoices,
    ] = useState([]);

    const [
      patients,
      setPatients,
    ] = useState([]);

    const [
      doctors,
      setDoctors,
    ] = useState([]);

    // =================================================
    // UI
    // =================================================

    const [
      searchQuery,
      setSearchQuery,
    ] = useState("");

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      error,
      setError,
    ] = useState("");

    const [
      actionId,
      setActionId,
    ] = useState(null);

    // =================================================
    // PAYMENT
    // =================================================

    const [
      confirmCollectId,
      setConfirmCollectId,
    ] = useState(null);

    const [
      collecting,
      setCollecting,
    ] = useState(false);

    // =================================================
    // WALK-IN
    // =================================================

    const [
      showWalkInModal,
      setShowWalkInModal,
    ] = useState(false);

    const [
      walkInSaving,
      setWalkInSaving,
    ] = useState(false);

    const [
      walkInForm,
      setWalkInForm,
    ] = useState(
      createInitialWalkInForm
    );

    // =================================================
    // LOAD
    // =================================================

    const fetchData =
      useCallback(async () => {
        setLoading(true);
        setError("");

        try {
          /*
           * RECEPTIONIST được phép xem dữ liệu
           * toàn hệ thống phục vụ tiếp đón.
           *
           * Không .catch(() => []) riêng lẻ.
           */
          const [
            appointmentResponse,
            invoiceResponse,
            patientResponse,
            doctorResponse,
          ] = await Promise.all([
            appointmentService
              .getAllAppointments(),

            paymentService
              .getAllInvoices(),

            patientService
              .getAllPatients(),

            doctorService
              .getAllDoctors(),
          ]);

          setAppointments(
            Array.isArray(
              appointmentResponse
            )
              ? appointmentResponse
              : []
          );

          setInvoices(
            Array.isArray(
              invoiceResponse
            )
              ? invoiceResponse
              : []
          );

          setPatients(
            Array.isArray(
              patientResponse
            )
              ? patientResponse
              : []
          );

          setDoctors(
            Array.isArray(
              doctorResponse
            )
              ? doctorResponse
              : []
          );
        } catch (err) {
          console.error(
            "Receptionist dashboard load failed:",
            err
          );

          setError(
            err?.message ||
              "Không thể tải dữ liệu quầy lễ tân."
          );
        } finally {
          setLoading(false);
        }
      }, []);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    // =================================================
    // MAP BUSINESS IDS -> NAMES
    // =================================================

    const patientMap =
      useMemo(() => {
        return new Map(
          patients.map(
            (patient) => [
              Number(patient.id),
              patient,
            ]
          )
        );
      }, [patients]);

    const doctorMap =
      useMemo(() => {
        return new Map(
          doctors.map(
            (doctor) => [
              Number(doctor.id),
              doctor,
            ]
          )
        );
      }, [doctors]);

    // =================================================
    // AVAILABLE DOCTORS
    // =================================================

    const availableDoctors =
      useMemo(() => {
        return doctors.filter(
          (doctor) =>
            doctor.available !== false
        );
      }, [doctors]);

    // =================================================
    // TODAY APPOINTMENTS
    // =================================================

    const todayAppointments =
      useMemo(() => {
        return appointments
          .filter((appointment) =>
            isToday(
              appointment.appointmentTime
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
      }, [appointments]);

    // =================================================
    // FILTER
    // =================================================

    const filteredAppointments =
      useMemo(() => {
        const query =
          searchQuery
            .trim()
            .toLowerCase();

        if (!query) {
          return todayAppointments;
        }

        return todayAppointments.filter(
          (appointment) => {
            const patient =
              patientMap.get(
                Number(
                  appointment.patientId
                )
              );

            const doctor =
              doctorMap.get(
                Number(
                  appointment.doctorId
                )
              );

            return [
              appointment.id,
              appointment.patientId,
              patient?.fullName,
              patient?.phone,
              doctor?.fullName,
            ].some((value) =>
              String(value ?? "")
                .toLowerCase()
                .includes(query)
            );
          }
        );
      }, [
        todayAppointments,
        searchQuery,
        patientMap,
        doctorMap,
      ]);

    // =================================================
    // STATUS TRANSITION
    //
    // PENDING
    //   ↓ confirm
    // CONFIRMED
    //   ↓ check-in
    // CHECKED_IN
    //   ↓ waiting
    // WAITING
    //   ↓ Doctor xử lý
    // =================================================

    const handleAppointmentAction =
      async (appointment) => {
        if (!appointment?.id) {
          return;
        }

        setActionId(appointment.id);
        setError("");

        try {
          switch (
            appointment.status
          ) {
            case "PENDING":
              await appointmentService
                .confirmAppointment(
                  appointment.id
                );
              break;

            case "CONFIRMED":
              await appointmentService
                .checkInAppointment(
                  appointment.id
                );
              break;

            case "CHECKED_IN":
              await appointmentService
                .markWaiting(
                  appointment.id
                );
              break;

            default:
              return;
          }

          await fetchData();
        } catch (err) {
          console.error(
            "Appointment status update failed:",
            err
          );

          setError(
            err?.message ||
              "Không thể cập nhật trạng thái lịch hẹn."
          );
        } finally {
          setActionId(null);
        }
      };

    // =================================================
    // ACTION LABEL
    // =================================================

    const getAppointmentAction =
      (appointment) => {
        switch (
          appointment.status
        ) {
          case "PENDING":
            return {
              enabled: true,
              label:
                "Xác nhận lịch",
            };

          case "CONFIRMED":
            return {
              enabled: true,
              label:
                "Check-in",
            };

          case "CHECKED_IN":
            return {
              enabled: true,
              label:
                "Đưa vào hàng chờ",
            };

          case "WAITING":
            return {
              enabled: false,
              label:
                "Đang chờ bác sĩ",
            };

          case "EXAMINING":
            return {
              enabled: false,
              label:
                "Đang khám",
            };

          case "COMPLETED":
            return {
              enabled: false,
              label:
                "Đã hoàn thành",
            };

          case "CANCELLED":
            return {
              enabled: false,
              label:
                "Đã hủy",
            };

          case "NO_SHOW":
            return {
              enabled: false,
              label:
                "Không đến",
            };

          default:
            return {
              enabled: false,
              label: "---",
            };
        }
      };

    // =================================================
    // WALK-IN
    //
    // Appointment mới luôn là PENDING.
    //
    // Vì bệnh nhân đang có mặt tại quầy:
    //
    // create
    //   ↓ PENDING
    // confirm
    //   ↓ CONFIRMED
    // check-in
    //   ↓ CHECKED_IN
    // waiting
    //   ↓ WAITING
    // =================================================

    const handleCreateWalkIn =
      async (event) => {
        event.preventDefault();

        setError("");

        const patientId =
          Number(
            walkInForm.patientId
          );

        const doctorId =
          Number(
            walkInForm.doctorId
          );

        if (
          !Number.isInteger(
            patientId
          ) ||
          patientId <= 0
        ) {
          setError(
            "Vui lòng chọn bệnh nhân."
          );

          return;
        }

        if (
          !Number.isInteger(
            doctorId
          ) ||
          doctorId <= 0
        ) {
          setError(
            "Vui lòng chọn bác sĩ."
          );

          return;
        }

        if (
          !walkInForm
            .appointmentTime
        ) {
          setError(
            "Vui lòng chọn thời gian khám."
          );

          return;
        }

        setWalkInSaving(true);

        try {
          // -----------------------------------------
          // 1. CREATE -> backend ép PENDING
          // -----------------------------------------

          const created =
            await appointmentService
              .createAppointment({
                patientId,
                doctorId,

                appointmentTime:
                  toBackendDateTime(
                    walkInForm
                      .appointmentTime
                  ),

                reason:
                  walkInForm.reason
                    .trim() ||
                  "Khám trực tiếp tại quầy tiếp đón",
              });

          if (!created?.id) {
            throw new Error(
              "Backend không trả Appointment ID."
            );
          }

          // -----------------------------------------
          // 2. PENDING -> CONFIRMED
          // -----------------------------------------

          await appointmentService
            .confirmAppointment(
              created.id
            );

          // -----------------------------------------
          // 3. CONFIRMED -> CHECKED_IN
          // -----------------------------------------

          await appointmentService
            .checkInAppointment(
              created.id
            );

          // -----------------------------------------
          // 4. CHECKED_IN -> WAITING
          // -----------------------------------------

          await appointmentService
            .markWaiting(
              created.id
            );

          setShowWalkInModal(
            false
          );

          setWalkInForm(
            createInitialWalkInForm()
          );

          await fetchData();
        } catch (err) {
          console.error(
            "Create walk-in failed:",
            err
          );

          /*
           * Nếu một bước giữa chuỗi thất bại,
           * KHÔNG fake success.
           *
           * fetchData lại để UI hiển thị
           * đúng trạng thái backend hiện tại.
           */
          setError(
            err?.message ||
              "Không thể tạo lượt khám trực tiếp."
          );

          await fetchData();
        } finally {
          setWalkInSaving(false);
        }
      };

    // =================================================
    // CASHIER
    // =================================================

    const handleConfirmCollectPayment =
      async () => {
        if (
          !confirmCollectId
        ) {
          return;
        }

        setCollecting(true);
        setError("");

        try {
          /*
           * Endpoint Invoice /pay
           * dành cho Receptionist/Admin.
           *
           * Backend chỉ cho:
           * UNPAID -> PAID
           */
          await paymentService
            .markInvoicePaid(
              confirmCollectId
            );

          setConfirmCollectId(
            null
          );

          await fetchData();
        } catch (err) {
          console.error(
            "Collect payment failed:",
            err
          );

          setError(
            err?.message ||
              "Không thể thu tiền hóa đơn."
          );
        } finally {
          setCollecting(false);
        }
      };

    // =================================================
    // STATS
    // =================================================

    const waitingCount =
      todayAppointments.filter(
        (appointment) =>
          [
            "CHECKED_IN",
            "WAITING",
          ].includes(
            appointment.status
          )
      ).length;

    const unpaidCount =
      invoices.filter(
        (invoice) =>
          invoice.status ===
          "UNPAID"
      ).length;

    // =================================================
    // UI
    // =================================================

    return (
      <DashboardLayout>
        {/* =========================================== */}
        {/* HEADER */}
        {/* =========================================== */}

        <PageHeader
          title="Bàn Tiếp Đón & Quầy Lễ Tân"
          description="Xác nhận lịch, Check-in, quản lý hàng chờ và thu phí"
          action={
            <button
              type="button"
              onClick={() => {
                setError("");

                setWalkInForm(
                  createInitialWalkInForm()
                );

                setShowWalkInModal(
                  true
                );
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />

              Tiếp Đón Trực Tiếp
            </button>
          }
        />

        {/* =========================================== */}
        {/* ERROR */}
        {/* =========================================== */}

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />

            <div className="flex-1">
              {error}
            </div>
          </div>
        )}

        {/* =========================================== */}
        {/* STATS */}
        {/* =========================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="saas-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="small-text font-semibold uppercase tracking-wider">
                Hẹn Khám Hôm Nay
              </span>

              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {
                  todayAppointments.length
                }
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="saas-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="small-text font-semibold uppercase tracking-wider">
                Đang Chờ Khám
              </span>

              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {
                  waitingCount
                }
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="saas-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="small-text font-semibold uppercase tracking-wider">
                Hóa Đơn Chưa Thu
              </span>

              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {
                  unpaidCount
                }
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* =========================================== */}
        {/* SEARCH */}
        {/* =========================================== */}

        <div className="saas-card mb-6 p-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

            <input
              type="text"
              value={
                searchQuery
              }
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Mã hẹn, tên, SĐT hoặc mã bệnh nhân..."
              className="input-field pl-9 text-xs"
            />
          </div>
        </div>

        {/* =========================================== */}
        {/* WORKSPACE */}
        {/* =========================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ========================================= */}
          {/* APPOINTMENT DESK */}
          {/* ========================================= */}

          <div className="lg:col-span-7 space-y-4">
            <h3 className="section-title flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />

              Danh Sách Tiếp Đón Hôm Nay
            </h3>

            {loading ? (
              <LoadingSkeleton.TableSkeleton
                rows={4}
              />
            ) : filteredAppointments.length ===
              0 ? (
              <EmptyState
                title="Không có lượt hẹn"
                message="Không tìm thấy lịch hẹn phù hợp trong hôm nay."
              />
            ) : (
              <div className="saas-table-container">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>
                        Mã Hẹn
                      </th>

                      <th>
                        Bệnh Nhân
                      </th>

                      <th>
                        Bác Sĩ
                      </th>

                      <th>
                        Thời Gian
                      </th>

                      <th>
                        Trạng Thái
                      </th>

                      <th className="text-right">
                        Thao Tác
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAppointments.map(
                      (
                        appointment
                      ) => {
                        const patient =
                          patientMap.get(
                            Number(
                              appointment.patientId
                            )
                          );

                        const doctor =
                          doctorMap.get(
                            Number(
                              appointment.doctorId
                            )
                          );

                        const action =
                          getAppointmentAction(
                            appointment
                          );

                        const processing =
                          actionId ===
                          appointment.id;

                        return (
                          <tr
                            key={
                              appointment.id
                            }
                          >
                            <td className="font-mono font-bold">
                              APP-
                              {
                                appointment.id
                              }
                            </td>

                            <td>
                              <div className="font-bold">
                                {patient?.fullName ||
                                  `Bệnh nhân #${appointment.patientId}`}
                              </div>

                              {patient?.phone && (
                                <div className="small-text">
                                  {
                                    patient.phone
                                  }
                                </div>
                              )}
                            </td>

                            <td className="small-text">
                              {doctor?.fullName ||
                                `Bác sĩ #${appointment.doctorId}`}
                            </td>

                            <td className="small-text">
                              {formatDateTime(
                                appointment.appointmentTime
                              )}
                            </td>

                            <td>
                              <StatusBadge
                                status={
                                  appointment.status
                                }
                              />
                            </td>

                            <td className="text-right">
                              {action.enabled ? (
                                <button
                                  type="button"
                                  disabled={
                                    processing
                                  }
                                  onClick={() =>
                                    handleAppointmentAction(
                                      appointment
                                    )
                                  }
                                  className="btn-primary text-xs h-8 py-0 px-3 ml-auto flex items-center gap-1.5 disabled:opacity-60"
                                >
                                  {processing && (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  )}

                                  {
                                    action.label
                                  }
                                </button>
                              ) : (
                                <span
                                  className={`text-xs font-semibold ${
                                    appointment.status ===
                                    "COMPLETED"
                                      ? "text-emerald-600"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {
                                    action.label
                                  }
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ========================================= */}
          {/* BILLING */}
          {/* ========================================= */}

          <div className="lg:col-span-5 space-y-4">
            <h3 className="section-title flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600" />

              Quầy Thu Tiền
            </h3>

            {loading ? (
              <LoadingSkeleton.TableSkeleton
                rows={3}
              />
            ) : invoices.length ===
              0 ? (
              <EmptyState
                title="Không có hóa đơn"
                message="Chưa có hóa đơn nào."
              />
            ) : (
              <div className="space-y-4">
                {invoices.map(
                  (invoice) => {
                    const patient =
                      patientMap.get(
                        Number(
                          invoice.patientId
                        )
                      );

                    return (
                      <div
                        key={
                          invoice.id
                        }
                        className="saas-card space-y-3 p-4 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-extrabold">
                            INV-
                            {
                              invoice.id
                            }
                          </span>

                          <StatusBadge
                            status={
                              invoice.status
                            }
                          />
                        </div>

                        <div className="small-text">
                          {patient?.fullName ||
                            `Bệnh nhân #${invoice.patientId}`}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="small-text">
                            {invoice.appointmentId
                              ? `APP-${invoice.appointmentId}`
                              : "---"}
                          </span>

                          <span className="font-extrabold text-base text-blue-600 dark:text-blue-400">
                            {formatMoney(
                              invoice.totalAmount
                            )}
                          </span>
                        </div>

                        {invoice.status ===
                        "UNPAID" ? (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmCollectId(
                                invoice.id
                              )
                            }
                            className="btn-primary w-full h-9 text-xs font-bold"
                          >
                            Thu Tiền Tại Quầy
                          </button>
                        ) : invoice.status ===
                          "PAID" ? (
                          <div className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />

                            Đã thanh toán
                          </div>
                        ) : (
                          <span className="small-text">
                            Không thể thu
                          </span>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

        {/* =========================================== */}
        {/* PAYMENT CONFIRM */}
        {/* =========================================== */}

        <ConfirmDialog
          isOpen={Boolean(
            confirmCollectId
          )}
          title="Thu Phí Hóa Đơn"
          message={`Xác nhận đã thu tiền cho hóa đơn INV-${confirmCollectId}?`}
          confirmText={
            collecting
              ? "Đang xử lý..."
              : "Xác Nhận Đã Thu"
          }
          cancelText="Hủy"
          onConfirm={
            handleConfirmCollectPayment
          }
          onCancel={() => {
            if (!collecting) {
              setConfirmCollectId(
                null
              );
            }
          }}
        />

        {/* =========================================== */}
        {/* WALK-IN MODAL */}
        {/* =========================================== */}

        {showWalkInModal && (
          <div className="modal-overlay">
            <div className="modal-container p-6 space-y-5">
              <div>
                <h3 className="card-title">
                  Tiếp Đón Bệnh Nhân Trực Tiếp
                </h3>

                <p className="small-text mt-1">
                  Chọn hồ sơ bệnh nhân và bác sĩ thật từ hệ thống.
                </p>
              </div>

              <form
                onSubmit={
                  handleCreateWalkIn
                }
                className="space-y-4 text-xs"
              >
                {/* PATIENT */}

                <div>
                  <label className="block font-bold mb-1">
                    Bệnh nhân *
                  </label>

                  <select
                    required
                    value={
                      walkInForm.patientId
                    }
                    onChange={(event) =>
                      setWalkInForm(
                        (current) => ({
                          ...current,

                          patientId:
                            event.target.value,
                        })
                      )
                    }
                    className="input-field"
                  >
                    <option value="">
                      -- Chọn bệnh nhân --
                    </option>

                    {patients.map(
                      (patient) => (
                        <option
                          key={
                            patient.id
                          }
                          value={
                            patient.id
                          }
                        >
                          PAT-
                          {patient.id}
                          {" - "}
                          {patient.fullName ||
                            "Chưa có tên"}

                          {patient.phone
                            ? ` - ${patient.phone}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>

                  {patients.length ===
                    0 && (
                    <p className="mt-1 text-amber-600">
                      Chưa có hồ sơ bệnh nhân. Cần tạo hồ sơ Patient trước khi tạo Appointment.
                    </p>
                  )}
                </div>

                {/* DOCTOR */}

                <div>
                  <label className="block font-bold mb-1">
                    Bác sĩ tiếp nhận *
                  </label>

                  <select
                    required
                    value={
                      walkInForm.doctorId
                    }
                    onChange={(event) =>
                      setWalkInForm(
                        (current) => ({
                          ...current,

                          doctorId:
                            event.target.value,
                        })
                      )
                    }
                    className="input-field"
                  >
                    <option value="">
                      -- Chọn bác sĩ --
                    </option>

                    {availableDoctors.map(
                      (doctor) => (
                        <option
                          key={
                            doctor.id
                          }
                          value={
                            doctor.id
                          }
                        >
                          {doctor.fullName ||
                            `Bác sĩ #${doctor.id}`}

                          {doctor.specialization
                            ? ` - ${doctor.specialization}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* DATETIME */}

                <div>
                  <label className="block font-bold mb-1">
                    Thời gian khám *
                  </label>

                  <input
                    required
                    type="datetime-local"
                    value={
                      walkInForm.appointmentTime
                    }
                    onChange={(event) =>
                      setWalkInForm(
                        (current) => ({
                          ...current,

                          appointmentTime:
                            event.target.value,
                        })
                      )
                    }
                    className="input-field"
                  />

                  <p className="small-text mt-1">
                    Backend sẽ kiểm tra lịch làm việc và trùng lịch của bác sĩ.
                  </p>
                </div>

                {/* REASON */}

                <div>
                  <label className="block font-bold mb-1">
                    Lý do khám
                  </label>

                  <input
                    type="text"
                    value={
                      walkInForm.reason
                    }
                    onChange={(event) =>
                      setWalkInForm(
                        (current) => ({
                          ...current,

                          reason:
                            event.target.value,
                        })
                      )
                    }
                    className="input-field"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
                  Lượt trực tiếp sẽ đi đúng luồng:
                  <strong>
                    {" "}
                    PENDING → CONFIRMED → CHECKED_IN → WAITING
                  </strong>
                  .
                </div>

                {/* BUTTONS */}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={
                      walkInSaving
                    }
                    onClick={() =>
                      setShowWalkInModal(
                        false
                      )
                    }
                    className="btn-secondary flex-1 h-10"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={
                      walkInSaving ||
                      patients.length ===
                        0 ||
                      availableDoctors.length ===
                        0
                    }
                    className="btn-primary flex-1 h-10 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {walkInSaving && (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    )}

                    {walkInSaving
                      ? "Đang tiếp nhận..."
                      : "Tạo Lượt & Vào Hàng Chờ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  };

export default ReceptionistDashboard;
