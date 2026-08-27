import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { appointmentService } from "../services/appointmentService";
import { medicalService } from "../services/medicalService";
import { prescriptionService } from "../services/prescriptionService";
import { paymentService } from "../services/paymentService";

import DashboardLayout from "../layouts/DashboardLayout";

import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";

import {
  Calendar,
  FileText,
  Pill,
  CreditCard,
  Plus,
  QrCode,
  CheckCircle,
  AlertCircle,
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

const formatDate = (value) => {
  if (!value) {
    return "---";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "---";
  }

  return date.toLocaleDateString(
    "vi-VN"
  );
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

export const PatientDashboard = () => {
  // ===================================================
  // AUTH
  //
  // patientId này là patientProfile.id THẬT,
  // không phải Auth user.id.
  // ===================================================

  const {
    user,
    patientId,
    patientProfile,
  } = useAuth();

  // ===================================================
  // UI STATE
  // ===================================================

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "appointments"
  );

  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [
    records,
    setRecords,
  ] = useState([]);

  const [
    prescriptions,
    setPrescriptions,
  ] = useState([]);

  const [
    invoices,
    setInvoices,
  ] = useState([]);

  const [
    payments,
    setPayments,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [warnings, setWarnings] =
    useState([]);

  // ===================================================
  // MODAL STATE
  // ===================================================

  const [
    cancelId,
    setCancelId,
  ] = useState(null);

  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  const [
    selectedRecord,
    setSelectedRecord,
  ] = useState(null);

  const [
    payingInvoice,
    setPayingInvoice,
  ] = useState(null);

  const [
    paying,
    setPaying,
  ] = useState(false);

  const [
    paymentSuccess,
    setPaymentSuccess,
  ] = useState(false);

  // Transaction code giả lập QR trong đồ án.
  // Backend non-CASH yêu cầu transactionCode.
  const [
    transactionCode,
    setTransactionCode,
  ] = useState("");

  // ===================================================
  // LOAD DATA
  // ===================================================

  const fetchData =
    useCallback(
      async () => {
        if (!patientId) {
          setAppointments([]);
          setRecords([]);
          setPrescriptions([]);
          setInvoices([]);
          setPayments([]);

          setLoading(false);

          setError(
            "Tài khoản này chưa có hồ sơ bệnh nhân. Vui lòng liên hệ lễ tân hoặc quản trị viên để hoàn thiện hồ sơ."
          );

          return;
        }

        setLoading(true);
        setError("");
        setWarnings([]);

        try {
          /*
           * TUYỆT ĐỐI KHÔNG:
           *
           * getByPatient(patientId)
           *   .catch(() => getAll())
           *
           * Nếu API của Patient lỗi thì phải báo lỗi,
           * không được lấy dữ liệu toàn hệ thống.
           */
          const results =
            await Promise.allSettled([
              appointmentService
                .getAppointmentsByPatient(
                  patientId
                ),

              medicalService
                .getRecordsByPatient(
                  patientId
                ),

              prescriptionService
                .getByPatientId(
                  patientId
                ),

              paymentService
                .getInvoicesByPatient(
                  patientId
                ),

              paymentService
                .getPaymentsByPatient(
                  patientId
                ),
            ]);

          const [
            appointmentResult,
            recordResult,
            prescriptionResult,
            invoiceResult,
            paymentResult,
          ] = results;

          const serviceNames = [
            "lịch hẹn",
            "bệnh án",
            "đơn thuốc",
            "hóa đơn",
            "thanh toán",
          ];

          setWarnings(
            results.flatMap((result, index) =>
              result.status === "rejected"
                ? [`Không tải được ${serviceNames[index]}: ${result.reason?.message || "Service không phản hồi"}`]
                : []
            )
          );

          // -----------------------------------------
          // APPOINTMENTS
          // -----------------------------------------

          if (
            appointmentResult.status ===
            "fulfilled"
          ) {
            setAppointments(
              Array.isArray(
                appointmentResult.value
              )
                ? appointmentResult.value
                : []
            );
          } else {
            setAppointments([]);
          }

          // -----------------------------------------
          // MEDICAL RECORDS
          // -----------------------------------------

          if (
            recordResult.status ===
            "fulfilled"
          ) {
            setRecords(
              Array.isArray(
                recordResult.value
              )
                ? recordResult.value
                : []
            );
          } else {
            setRecords([]);
          }

          // -----------------------------------------
          // PRESCRIPTIONS
          // -----------------------------------------

          if (
            prescriptionResult.status ===
            "fulfilled"
          ) {
            setPrescriptions(
              Array.isArray(
                prescriptionResult.value
              )
                ? prescriptionResult.value
                : []
            );
          } else {
            setPrescriptions([]);
          }

          // -----------------------------------------
          // INVOICES
          // -----------------------------------------

          if (
            invoiceResult.status ===
            "fulfilled"
          ) {
            setInvoices(
              Array.isArray(
                invoiceResult.value
              )
                ? invoiceResult.value
                : []
            );
          } else {
            setInvoices([]);
          }

          // -----------------------------------------
          // PAYMENTS
          // -----------------------------------------

          if (
            paymentResult.status ===
            "fulfilled"
          ) {
            setPayments(
              Array.isArray(
                paymentResult.value
              )
                ? paymentResult.value
                : []
            );
          } else {
            setPayments([]);
          }

          // Nếu tất cả request đều fail,
          // hiển thị lỗi thay vì dashboard trống giả.
          const allFailed =
            results.every(
              (result) =>
                result.status ===
                "rejected"
            );

          if (allFailed) {
            throw new Error(
              "Không thể tải dữ liệu bệnh nhân."
            );
          }
        } catch (err) {
          console.error(
            "Patient dashboard load failed:",
            err
          );

          setError(
            err?.message ||
              "Không thể tải dữ liệu bệnh nhân."
          );
        } finally {
          setLoading(false);
        }
      },
      [patientId]
    );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===================================================
  // CANCEL APPOINTMENT
  // ===================================================

  const handleConfirmCancel =
    async () => {
      if (!cancelId) {
        return;
      }

      const selectedAppointment =
        appointments.find(
          (item) => Number(item.id) === Number(cancelId)
        );

      if (
        !selectedAppointment ||
        !["PENDING", "CONFIRMED"].includes(selectedAppointment.status)
      ) {
        setCancelId(null);
        setError("Chỉ có thể hủy lịch đang chờ hoặc đã xác nhận.");
        return;
      }

      setCancelling(true);
      setError("");

      try {
        await appointmentService
          .cancelAppointment(
            cancelId
          );

        setCancelId(null);

        await fetchData();
      } catch (err) {
        setError(
          err?.message ||
            "Không thể hủy lịch hẹn."
        );
      } finally {
        setCancelling(false);
      }
    };

  // ===================================================
  // OPEN PAYMENT
  // ===================================================

  const openPaymentModal = (
    invoice
  ) => {
    setPaymentSuccess(false);

    /*
     * Demo QR không phải cổng ngân hàng thật.
     * Sinh transaction code để backend có mã
     * giao dịch cho phương thức non-CASH.
     */
    setTransactionCode(
      `QR-${Date.now()}`
    );

    setPayingInvoice(
      invoice
    );
  };

  // ===================================================
  // PAYMENT
  //
  // Invoice UNPAID
  //     ↓
  // POST /api/payments
  //     ↓
  // Payment PENDING
  //     ↓
  // PATCH /api/payments/{id}/pay
  //     ↓
  // Payment PAID
  // Invoice PAID
  // ===================================================

  const handlePayInvoice =
    async () => {
      if (
        !payingInvoice ||
        !patientId
      ) {
        return;
      }

      if (payingInvoice.status !== "UNPAID") {
        setPayingInvoice(null);
        setError("Chỉ hóa đơn UNPAID mới có thể thanh toán.");
        return;
      }

      if (
        !payingInvoice.appointmentId
      ) {
        setError(
          "Hóa đơn không có Appointment ID."
        );

        return;
      }

      setPaying(true);
      setError("");

      try {
        // -----------------------------------------
        // Kiểm tra xem appointment này
        // đã có Payment hay chưa.
        // -----------------------------------------

        let payment =
          payments.find(
            (item) =>
              Number(
                item.appointmentId
              ) ===
              Number(
                payingInvoice.appointmentId
              )
          );

        // -----------------------------------------
        // Chưa có Payment -> tạo PENDING
        // -----------------------------------------

        if (!payment) {
          payment =
            await paymentService
              .createPayment({
                appointmentId:
                  payingInvoice
                    .appointmentId,

                patientId,

                invoiceId:
                  payingInvoice.id,

                /*
                 * Đây là demo QR/banking,
                 * không dùng CASH.
                 */
                paymentMethod:
                  "BANK_TRANSFER",
              });
        }

        if (!payment?.id) {
          throw new Error(
            "Không tạo được giao dịch thanh toán."
          );
        }

        // Nếu Payment đã PAID thì không gọi pay lại.
        if (
          payment.status !== "PAID"
        ) {
          await paymentService
            .payPayment(
              payment.id,
              transactionCode
            );
        }

        setPaymentSuccess(true);

        await fetchData();

        window.setTimeout(
          () => {
            setPayingInvoice(
              null
            );

            setPaymentSuccess(
              false
            );

            setTransactionCode(
              ""
            );
          },
          1200
        );
      } catch (err) {
        console.error(
          "Payment failed:",
          err
        );

        setError(
          err?.message ||
            "Thanh toán thất bại."
        );
      } finally {
        setPaying(false);
      }
    };

  // ===================================================
  // PAYMENT LOOKUP
  // ===================================================

  const getPaymentForInvoice = (
    invoice
  ) => {
    return payments.find(
      (payment) =>
        Number(
          payment.invoiceId
        ) ===
          Number(invoice.id) ||
        Number(
          payment.appointmentId
        ) ===
          Number(
            invoice.appointmentId
          )
    );
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <DashboardLayout>
      <PageHeader
        title={`Xin chào, ${
          user?.fullName ||
          "Bệnh nhân"
        }`}
        description={
          patientId
            ? `Mã bệnh nhân: PAT-${patientId} | Quản lý lịch khám và hồ sơ y tế`
            : "Tài khoản chưa được liên kết với hồ sơ bệnh nhân"
        }
        action={
          patientId ? (
            <Link
              to="/patient/book"
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />

              Đặt Lịch Khám Mới
            </Link>
          ) : null
        }
      />

      {/* ============================================= */}
      {/* ERROR */}
      {/* ============================================= */}

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm flex gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />

          <span>
            {error}
          </span>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          <div className="font-bold mb-2">Một số dữ liệu chưa tải được:</div>
          <ul className="list-disc pl-5 space-y-1">
            {warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}

      {/* ============================================= */}
      {/* NO PATIENT PROFILE */}
      {/* ============================================= */}

      {!loading &&
      !patientId ? (
        <EmptyState
          title="Chưa có hồ sơ bệnh nhân"
          message="Tài khoản đã đăng nhập thành công nhưng chưa được liên kết với hồ sơ bệnh nhân. Không thể đặt lịch hoặc xem dữ liệu y tế cho đến khi hồ sơ được tạo."
        />
      ) : (
        <>
          {/* ========================================= */}
          {/* STAT CARDS */}
          {/* ========================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="saas-card flex items-center justify-between">
              <div className="space-y-1">
                <span className="small-text font-semibold uppercase tracking-wider">
                  Tổng Lịch Hẹn
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
                  Hồ Sơ Bệnh Án
                </span>

                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {
                    records.length
                  }
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="saas-card flex items-center justify-between">
              <div className="space-y-1">
                <span className="small-text font-semibold uppercase tracking-wider">
                  Đơn Thuốc
                </span>

                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {
                    prescriptions.length
                  }
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
            </div>

            <div className="saas-card flex items-center justify-between">
              <div className="space-y-1">
                <span className="small-text font-semibold uppercase tracking-wider">
                  Hóa Đơn Chưa Thanh Toán
                </span>

                <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                  {
                    invoices.filter(
                      (invoice) =>
                        invoice.status ===
                        "UNPAID"
                    ).length
                  }
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* TABS */}
          {/* ========================================= */}

          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 mb-6 overflow-x-auto">
            {[
              {
                id:
                  "appointments",
                label:
                  "Lịch Hẹn Khám",
                icon:
                  Calendar,
              },
              {
                id: "records",
                label:
                  "Hồ Sơ Bệnh Án",
                icon:
                  FileText,
              },
              {
                id:
                  "prescriptions",
                label:
                  "Đơn Thuốc",
                icon:
                  Pill,
              },
              {
                id: "invoices",
                label:
                  "Hóa Đơn & Thanh Toán",
                icon:
                  CreditCard,
              },
            ].map(
              (tab) => {
                const Icon =
                  tab.icon;

                const active =
                  activeTab ===
                  tab.id;

                return (
                  <button
                    key={
                      tab.id
                    }
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        tab.id
                      )
                    }
                    className={`pb-4 pt-1 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                      active
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />

                    <span>
                      {
                        tab.label
                      }
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {/* ========================================= */}
          {/* CONTENT */}
          {/* ========================================= */}

          {loading ? (
            <LoadingSkeleton.TableSkeleton
              rows={4}
            />
          ) : (
            <div className="space-y-6">
              {/* ===================================== */}
              {/* APPOINTMENTS */}
              {/* ===================================== */}

              {activeTab ===
                "appointments" &&
                (appointments.length ===
                0 ? (
                  <EmptyState
                    title="Chưa có lịch khám"
                    message="Bạn chưa có lịch khám nào."
                    action={
                      <Link
                        to="/patient/book"
                        className="btn-primary"
                      >
                        <Plus className="w-4 h-4" />

                        Đặt Lịch Khám
                      </Link>
                    }
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
                            Thời gian khám
                          </th>

                          <th>
                            Bác sĩ
                          </th>

                          <th>
                            Lý do
                          </th>

                          <th>
                            Trạng thái
                          </th>

                          <th className="text-right">
                            Thao tác
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {appointments.map(
                          (
                            appointment
                          ) => (
                            <tr
                              key={
                                appointment.id
                              }
                            >
                              <td className="font-mono font-bold">
                                #APP-
                                {
                                  appointment.id
                                }
                              </td>

                              <td className="font-medium">
                                {formatDateTime(
                                  appointment.appointmentTime
                                )}
                              </td>

                              <td className="font-semibold text-blue-600 dark:text-blue-400">
                                {appointment.doctorName ||
                                  `Bác sĩ #${appointment.doctorId}`}
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
                                {[
                                  "PENDING",
                                  "CONFIRMED",
                                ].includes(
                                  appointment.status
                                ) ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCancelId(
                                        appointment.id
                                      )
                                    }
                                    className="text-xs text-rose-600 hover:underline font-bold"
                                  >
                                    Hủy hẹn
                                  </button>
                                ) : (
                                  <span className="small-text">
                                    ---
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}

              {/* ===================================== */}
              {/* MEDICAL RECORDS */}
              {/* ===================================== */}

              {activeTab ===
                "records" &&
                (records.length ===
                0 ? (
                  <EmptyState
                    title="Chưa có bệnh án"
                    message="Hồ sơ bệnh án sẽ hiển thị sau khi ca khám được hoàn tất."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {records.map(
                      (
                        record
                      ) => (
                        <div
                          key={
                            record.id
                          }
                          className="saas-card space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-blue-600">
                              BỆNH ÁN #
                              {
                                record.id
                              }
                            </span>

                            <span className="small-text">
                              {formatDate(
                                record.examinationDate ||
                                  record.createdAt
                              )}
                            </span>
                          </div>

                          <div>
                            <span className="small-text block">
                              Chẩn đoán
                            </span>

                            <h4 className="card-title text-slate-900 dark:text-white mt-0.5">
                              {record.diagnosis ||
                                "Chưa cập nhật"}
                            </h4>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                            <p>
                              <strong>
                                Triệu chứng:
                              </strong>{" "}
                              {record.symptoms ||
                                "---"}
                            </p>

                            <p>
                              <strong>
                                Điều trị:
                              </strong>{" "}
                              {record.treatment ||
                                "---"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedRecord(
                                record
                              )
                            }
                            className="btn-secondary w-full text-xs font-bold h-10"
                          >
                            Xem chi tiết bệnh án
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ))}

              {/* ===================================== */}
              {/* PRESCRIPTIONS */}
              {/* ===================================== */}

              {activeTab ===
                "prescriptions" &&
                (prescriptions.length ===
                0 ? (
                  <EmptyState
                    title="Chưa có đơn thuốc"
                    message="Đơn thuốc do bác sĩ kê sẽ hiển thị tại đây."
                  />
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map(
                      (
                        prescription
                      ) => (
                        <div
                          key={
                            prescription.id
                          }
                          className="saas-card space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Pill className="w-5 h-5 text-purple-600" />

                              <span className="card-title">
                                Đơn Thuốc #
                                {
                                  prescription.id
                                }
                              </span>
                            </div>

                            <span className="small-text">
                              {formatDate(
                                prescription.createdAt
                              )}
                            </span>
                          </div>

                          {Array.isArray(
                            prescription.items
                          ) &&
                          prescription
                            .items
                            .length >
                            0 ? (
                            <div className="overflow-x-auto">
                              <table className="saas-table">
                                <thead>
                                  <tr>
                                    <th>
                                      Thuốc
                                    </th>

                                    <th>
                                      Liều dùng
                                    </th>

                                    <th>
                                      Tần suất
                                    </th>

                                    <th>
                                      Thời gian
                                    </th>

                                    <th>
                                      Số lượng
                                    </th>

                                    <th>
                                      Hướng dẫn
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {prescription.items.map(
                                    (
                                      item,
                                      index
                                    ) => (
                                      <tr
                                        key={
                                          item.id ||
                                          `${prescription.id}-${index}`
                                        }
                                      >
                                        <td>
                                          {item.medicineName ||
                                            `Thuốc #${item.medicineId}`}
                                        </td>

                                        <td>
                                          {item.dosage ||
                                            "---"}
                                        </td>

                                        <td>
                                          {item.frequency ||
                                            "---"}
                                        </td>

                                        <td>
                                          {item.duration ||
                                            "---"}
                                        </td>

                                        <td>
                                          {item.quantity ??
                                            "---"}
                                        </td>

                                        <td>
                                          {item.instructions ||
                                            "---"}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="small-text">
                              Không có chi tiết thuốc.
                            </p>
                          )}

                          {prescription.notes && (
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs">
                              <strong>
                                Ghi chú:
                              </strong>{" "}
                              {
                                prescription.notes
                              }
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ))}

              {/* ===================================== */}
              {/* INVOICES */}
              {/* ===================================== */}

              {activeTab ===
                "invoices" &&
                (invoices.length ===
                0 ? (
                  <EmptyState
                    title="Không có hóa đơn"
                    message="Bạn chưa có hóa đơn khám chữa bệnh."
                  />
                ) : (
                  <div className="saas-table-container">
                    <table className="saas-table">
                      <thead>
                        <tr>
                          <th>
                            Mã Hóa Đơn
                          </th>

                          <th>
                            Lịch khám
                          </th>

                          <th>
                            Tổng tiền
                          </th>

                          <th>
                            Trạng thái
                          </th>

                          <th>
                            Giao dịch
                          </th>

                          <th className="text-right">
                            Thanh toán
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {invoices.map(
                          (
                            invoice
                          ) => {
                            const payment =
                              getPaymentForInvoice(
                                invoice
                              );

                            return (
                              <tr
                                key={
                                  invoice.id
                                }
                              >
                                <td className="font-mono font-bold">
                                  INV-
                                  {
                                    invoice.id
                                  }
                                </td>

                                <td>
                                  {invoice.appointmentId
                                    ? `APP-${invoice.appointmentId}`
                                    : "---"}
                                </td>

                                <td className="font-extrabold text-blue-600 dark:text-blue-400">
                                  {formatMoney(
                                    invoice.totalAmount
                                  )}
                                </td>

                                <td>
                                  <StatusBadge
                                    status={
                                      invoice.status
                                    }
                                  />
                                </td>

                                <td>
                                  {payment ? (
                                    <StatusBadge
                                      status={
                                        payment.status
                                      }
                                    />
                                  ) : (
                                    <span className="small-text">
                                      Chưa tạo
                                    </span>
                                  )}
                                </td>

                                <td className="text-right">
                                  {invoice.status ===
                                  "UNPAID" ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openPaymentModal(
                                          invoice
                                        )
                                      }
                                      className="btn-primary text-xs h-9 py-0 px-3 ml-auto"
                                    >
                                      Thanh Toán
                                    </button>
                                  ) : invoice.status ===
                                    "PAID" ? (
                                    <span className="text-xs text-emerald-600 font-bold">
                                      Đã thanh toán
                                    </span>
                                  ) : (
                                    <span className="small-text">
                                      ---
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
                ))}
            </div>
          )}
        </>
      )}

      {/* ============================================= */}
      {/* CANCEL */}
      {/* ============================================= */}

      <ConfirmDialog
        isOpen={Boolean(
          cancelId
        )}
        title="Hủy Lịch Hẹn Khám"
        message="Bạn có chắc chắn muốn hủy lịch hẹn này không?"
        confirmText={
          cancelling
            ? "Đang hủy..."
            : "Đồng ý Hủy"
        }
        cancelText="Quay lại"
        isDanger
        onConfirm={
          handleConfirmCancel
        }
        onCancel={() =>
          !cancelling &&
          setCancelId(null)
        }
      />

      {/* ============================================= */}
      {/* PAYMENT MODAL */}
      {/* ============================================= */}

      {payingInvoice && (
        <div className="modal-overlay">
          <div className="modal-container p-6 space-y-6 text-center">
            <h3 className="card-title">
              Thanh Toán Hóa Đơn
            </h3>

            {paymentSuccess ? (
              <div className="py-6 space-y-2">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />

                <h4 className="font-bold text-emerald-600">
                  Thanh Toán Thành Công
                </h4>

                <p className="small-text">
                  Hóa đơn INV-
                  {
                    payingInvoice.id
                  }{" "}
                  đã được cập nhật.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="small-text">
                    Hóa đơn INV-
                    {
                      payingInvoice.id
                    }
                  </span>

                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                    {formatMoney(
                      payingInvoice.totalAmount
                    )}
                  </div>
                </div>

                {/*
                 * Đây chỉ là biểu tượng QR phục vụ UI demo,
                 * KHÔNG khẳng định đang kết nối VNPay/MoMo.
                 */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 inline-block shadow-sm">
                  <QrCode className="w-36 h-36 mx-auto" />

                  <span className="small-text block mt-2">
                    Thanh toán chuyển khoản mô phỏng
                  </span>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold mb-1">
                    Mã giao dịch
                  </label>

                  <input
                    type="text"
                    value={
                      transactionCode
                    }
                    onChange={(
                      event
                    ) =>
                      setTransactionCode(
                        event.target
                          .value
                      )
                    }
                    className="input-field"
                    disabled={
                      paying
                    }
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPayingInvoice(
                        null
                      );

                      setTransactionCode(
                        ""
                      );
                    }}
                    disabled={
                      paying
                    }
                    className="btn-secondary flex-1 h-11"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="button"
                    onClick={
                      handlePayInvoice
                    }
                    disabled={
                      paying ||
                      !transactionCode.trim()
                    }
                    className="btn-primary flex-1 h-11"
                  >
                    {paying
                      ? "Đang xử lý..."
                      : "Xác nhận thanh toán"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* MEDICAL RECORD DETAIL */}
      {/* ============================================= */}

      {selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-container p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="card-title">
                Chi Tiết Bệnh Án #
                {
                  selectedRecord.id
                }
              </h3>

              <button
                type="button"
                onClick={() =>
                  setSelectedRecord(
                    null
                  )
                }
                className="text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <strong>
                  Ngày khám:
                </strong>{" "}
                {formatDateTime(
                  selectedRecord.examinationDate
                )}
              </p>

              <p>
                <strong>
                  Triệu chứng:
                </strong>{" "}
                {selectedRecord.symptoms ||
                  "---"}
              </p>

              <p>
                <strong>
                  Chẩn đoán:
                </strong>{" "}
                {selectedRecord.diagnosis ||
                  "---"}
              </p>

              <p>
                <strong>
                  Điều trị:
                </strong>{" "}
                {selectedRecord.treatment ||
                  "---"}
              </p>

              <p>
                <strong>
                  Ghi chú:
                </strong>{" "}
                {selectedRecord.notes ||
                  "---"}
              </p>
            </div>

            {/*
             * KHÔNG hiển thị:
             *
             * 120/80
             * 75 bpm
             * 36.8 C
             * 62 kg
             *
             * vì các số đó trong frontend cũ là hard-code.
             *
             * Bước Medical sau ta sẽ GET VitalSign thật
             * bằng medicalRecordId.
             */}

            <button
              type="button"
              onClick={() =>
                setSelectedRecord(
                  null
                )
              }
              className="btn-secondary w-full h-10 text-xs font-bold"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientDashboard;
