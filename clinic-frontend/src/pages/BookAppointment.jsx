import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import { doctorService } from "../services/doctorService";
import { appointmentService } from "../services/appointmentService";

import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/common/PageHeader";

// =====================================================
// DATE HELPERS
// =====================================================

const getLocalDateString = (
  date = new Date()
) => {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const JAVA_DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const getJavaDayOfWeek = (
  dateString
) => {
  const date =
    new Date(
      `${dateString}T00:00:00`
    );

  return JAVA_DAYS[
    date.getDay()
  ];
};

// =====================================================
// TIME HELPERS
// =====================================================

const timeToMinutes = (
  time
) => {
  if (!time) {
    return 0;
  }

  const [
    hour = 0,
    minute = 0,
  ] = time
    .split(":")
    .map(Number);

  return (
    hour * 60 +
    minute
  );
};

const minutesToTime = (
  minutes
) => {
  const hour =
    Math.floor(
      minutes / 60
    );

  const minute =
    minutes % 60;

  return `${String(hour).padStart(
    2,
    "0"
  )}:${String(minute).padStart(
    2,
    "0"
  )}`;
};

// =====================================================
// GENERATE SLOT TỪ DOCTOR SCHEDULE
//
// Ví dụ backend:
//
// startTime: 08:00
// endTime:   12:00
// slotDurationMinutes: 30
//
// =>
//
// 08:00
// 08:30
// 09:00
// ...
// 11:30
// =====================================================

const generateScheduleSlots = (
  schedules
) => {
  const slotSet =
    new Set();

  schedules.forEach(
    (schedule) => {
      if (
        schedule?.active === false
      ) {
        return;
      }

      const start =
        timeToMinutes(
          schedule?.startTime
        );

      const end =
        timeToMinutes(
          schedule?.endTime
        );

      const duration =
        Number(
          schedule
            ?.slotDurationMinutes
        );

      if (
        !duration ||
        duration <= 0 ||
        end <= start
      ) {
        return;
      }

      for (
        let current = start;
        current + duration <= end;
        current += duration
      ) {
        slotSet.add(
          minutesToTime(
            current
          )
        );
      }
    }
  );

  return Array.from(
    slotSet
  ).sort();
};

export const BookAppointment =
  () => {
    const navigate =
      useNavigate();

    const [searchParams] =
      useSearchParams();

    const {
      user,
      patientId,
      patientProfile,
    } = useAuth();

    // =================================================
    // DATA
    // =================================================

    const [
      specialties,
      setSpecialties,
    ] = useState([]);

    const [
      doctors,
      setDoctors,
    ] = useState([]);

    const [
      availableSlots,
      setAvailableSlots,
    ] = useState([]);

    // =================================================
    // FORM
    // =================================================

    const [
      specialtyId,
      setSpecialtyId,
    ] = useState("");

    const [
      doctorId,
      setDoctorId,
    ] = useState("");

    const [
      appointmentDate,
      setAppointmentDate,
    ] = useState("");

    const [
      selectedTime,
      setSelectedTime,
    ] = useState("");

    const [
      reason,
      setReason,
    ] = useState("");

    const [
      note,
      setNote,
    ] = useState("");

    // =================================================
    // STATE
    // =================================================

    const [
      loadingSpecialties,
      setLoadingSpecialties,
    ] = useState(true);

    const [
      loadingDoctors,
      setLoadingDoctors,
    ] = useState(false);

    const [
      loadingSlots,
      setLoadingSlots,
    ] = useState(false);

    const [
      submitting,
      setSubmitting,
    ] = useState(false);

    const [
      error,
      setError,
    ] = useState("");

    const [
      success,
      setSuccess,
    ] = useState("");

    const today =
      useMemo(
        () =>
          getLocalDateString(),
        []
      );

    // =================================================
    // LOAD SPECIALTIES
    // =================================================

    useEffect(() => {
      let mounted = true;

      const loadSpecialties =
        async () => {
          setLoadingSpecialties(
            true
          );

          try {
            const data =
              await doctorService
                .getActiveSpecialties();

            if (!mounted) {
              return;
            }

            setSpecialties(
              Array.isArray(data)
                ? data
                : []
            );
          } catch (err) {
            console.error(
              "Load specialties failed:",
              err
            );

            if (mounted) {
              setError(
                err?.message ||
                  "Không thể tải danh sách chuyên khoa."
              );
            }
          } finally {
            if (mounted) {
              setLoadingSpecialties(
                false
              );
            }
          }
        };

      loadSpecialties();

      return () => {
        mounted = false;
      };
    }, []);

    // Nhận lựa chọn từ Home hoặc trang tư vấn AI.
    useEffect(() => {
      if (specialties.length === 0) return;

      const specialtyQuery = searchParams.get("specialty");
      const doctorQuery = searchParams.get("doctorId");
      const dateQuery = searchParams.get("date");

      if (specialtyQuery && !specialtyId) {
        const matched = specialties.find(
          (item) => String(item.id) === specialtyQuery ||
            item.name?.toLowerCase() === specialtyQuery.toLowerCase()
        );
        if (matched) setSpecialtyId(String(matched.id));
      }

      if (
        doctorQuery &&
        !doctorId &&
        doctors.some((item) => String(item.id) === doctorQuery)
      ) setDoctorId(doctorQuery);
      if (dateQuery && dateQuery >= today && !appointmentDate) setAppointmentDate(dateQuery);
    }, [specialties, doctors, searchParams, specialtyId, doctorId, appointmentDate, today]);

    // =================================================
    // SPECIALTY -> DOCTORS
    // =================================================

    useEffect(() => {
      let mounted = true;

      const loadDoctors =
        async () => {
          setDoctorId("");
          setAppointmentDate("");
          setSelectedTime("");
          setAvailableSlots([]);

          if (!specialtyId) {
            setDoctors([]);
            return;
          }

          setLoadingDoctors(
            true
          );

          setError("");

          try {
            const data =
              await doctorService
                .getDoctorsBySpecialty(
                  specialtyId
                );

            if (!mounted) {
              return;
            }

            const activeDoctors =
              Array.isArray(data)
                ? data.filter(
                    (doctor) =>
                      doctor
                        ?.available !==
                      false
                  )
                : [];

            setDoctors(
              activeDoctors
            );
          } catch (err) {
            console.error(
              "Load doctors failed:",
              err
            );

            if (mounted) {
              setDoctors([]);

              setError(
                err?.message ||
                  "Không thể tải danh sách bác sĩ."
              );
            }
          } finally {
            if (mounted) {
              setLoadingDoctors(
                false
              );
            }
          }
        };

      loadDoctors();

      return () => {
        mounted = false;
      };
    }, [specialtyId]);

    // =================================================
    // DOCTOR + DATE
    // -> GET SCHEDULE
    // -> GENERATE SLOT
    // -> CHECK BACKEND AVAILABLE
    // =================================================

    useEffect(() => {
      let mounted = true;

      const loadSlots =
        async () => {
          setSelectedTime("");
          setAvailableSlots([]);

          if (
            !doctorId ||
            !appointmentDate
          ) {
            return;
          }

          setLoadingSlots(true);
          setError("");

          try {
            const dayOfWeek =
              getJavaDayOfWeek(
                appointmentDate
              );

            // -----------------------------------------
            // 1. Lấy lịch làm việc thật của bác sĩ
            // -----------------------------------------

            const schedules =
              await doctorService
                .getScheduleByDay(
                  doctorId,
                  dayOfWeek
                );

            const scheduleList =
              Array.isArray(
                schedules
              )
                ? schedules
                : [];

            if (
              scheduleList.length ===
              0
            ) {
              if (mounted) {
                setAvailableSlots(
                  []
                );
              }

              return;
            }

            // -----------------------------------------
            // 2. Sinh slot dựa trên:
            //
            // startTime
            // endTime
            // slotDurationMinutes
            // -----------------------------------------

            const candidates =
              generateScheduleSlots(
                scheduleList
              );

            const now =
              new Date();

            const futureCandidates =
              candidates.filter(
                (time) => {
                  const candidateDate =
                    new Date(
                      `${appointmentDate}T${time}:00`
                    );

                  return (
                    candidateDate >
                    now
                  );
                }
              );

            // -----------------------------------------
            // 3. Hỏi Appointment Service từng slot
            //
            // Không tự suy đoán slot trống.
            // -----------------------------------------

            const checked =
              await Promise.all(
                futureCandidates.map(
                  async (
                    time
                  ) => {
                    const appointmentTime =
                      `${appointmentDate}T${time}:00`;

                    try {
                      const result =
                        await appointmentService
                          .checkAvailableSlot(
                            doctorId,
                            appointmentTime
                          );

                      return {
                        time,
                        available:
                          result
                            ?.available ===
                          true,
                      };
                    } catch (err) {
                      console.error(
                        `Check slot ${appointmentTime} failed:`,
                        err
                      );

                      return {
                        time,
                        available:
                          false,
                      };
                    }
                  }
                )
              );

            if (!mounted) {
              return;
            }

            setAvailableSlots(
              checked
                .filter(
                  (slot) =>
                    slot.available
                )
                .map(
                  (slot) =>
                    slot.time
                )
            );
          } catch (err) {
            console.error(
              "Load available slots failed:",
              err
            );

            if (mounted) {
              setAvailableSlots(
                []
              );

              setError(
                err?.message ||
                  "Không thể kiểm tra lịch trống của bác sĩ."
              );
            }
          } finally {
            if (mounted) {
              setLoadingSlots(
                false
              );
            }
          }
        };

      loadSlots();

      return () => {
        mounted = false;
      };
    }, [
      doctorId,
      appointmentDate,
    ]);

    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit =
      async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!patientId) {
          setError(
            "Tài khoản chưa có hồ sơ bệnh nhân. Không thể đặt lịch."
          );

          return;
        }

        if (!specialtyId) {
          setError(
            "Vui lòng chọn chuyên khoa."
          );

          return;
        }

        if (!doctorId) {
          setError(
            "Vui lòng chọn bác sĩ."
          );

          return;
        }

        if (
          !appointmentDate
        ) {
          setError(
            "Vui lòng chọn ngày khám."
          );

          return;
        }

        if (!selectedTime) {
          setError(
            "Vui lòng chọn giờ khám."
          );

          return;
        }

        if (!reason.trim()) {
          setError(
            "Vui lòng nhập lý do khám."
          );

          return;
        }

        const appointmentTime =
          `${appointmentDate}T${selectedTime}:00`;

        setSubmitting(true);

        try {
          // -----------------------------------------
          // Kiểm tra lại slot ngay trước khi tạo.
          //
          // Tránh trường hợp người khác vừa đặt slot
          // trong lúc Patient đang điền form.
          // -----------------------------------------

          const slotCheck =
            await appointmentService
              .checkAvailableSlot(
                doctorId,
                appointmentTime
              );

          if (
            slotCheck?.available !==
            true
          ) {
            throw new Error(
              "Khung giờ này vừa được đặt hoặc bác sĩ không còn làm việc vào thời điểm này."
            );
          }

          // -----------------------------------------
          // Backend tự set status = PENDING.
          //
          // KHÔNG gửi:
          //
          // status: "CREATED"
          // status: "CONFIRMED"
          // -----------------------------------------

          const payload = {
            patientId:
              Number(patientId),

            doctorId:
              Number(doctorId),

            appointmentTime,

            reason:
              reason.trim(),

            note:
              note.trim() ||
              null,
          };

          const created =
            await appointmentService
              .createAppointment(
                payload
              );

          if (!created?.id) {
            throw new Error(
              "Backend không trả thông tin lịch hẹn vừa tạo."
            );
          }

          setSuccess(
            `Đặt lịch thành công. Mã lịch hẹn: APP-${created.id}. Trạng thái: ${created.status}.`
          );

          setTimeout(() => {
            navigate(
              "/patient/dashboard",
              {
                replace: true,
              }
            );
          }, 1200);
        } catch (err) {
          console.error(
            "Create appointment failed:",
            err
          );

          // Không fake success.
          setError(
            err?.message ||
              "Đặt lịch thất bại. Vui lòng thử lại."
          );
        } finally {
          setSubmitting(
            false
          );
        }
      };

    // =================================================
    // NO PATIENT PROFILE
    // =================================================

    if (!patientId) {
      return (
        <DashboardLayout>
          <PageHeader
            title="Đặt lịch khám"
            description="Đăng ký lịch khám với bác sĩ chuyên khoa"
          />

          <div className="saas-card max-w-2xl mx-auto">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Chưa có hồ sơ bệnh nhân
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Tài khoản của bạn đã đăng nhập nhưng chưa được liên kết với hồ sơ bệnh nhân.
                  Hệ thống sẽ không sử dụng Patient ID giả.
                </p>

                <Link
                  to="/patient/dashboard"
                  className="btn-secondary inline-flex mt-4"
                >
                  Quay lại Dashboard
                </Link>
              </div>
            </div>
          </div>
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout>
        <PageHeader
          title="Đặt lịch khám"
          description={`Bệnh nhân: ${
            patientProfile?.fullName ||
            user?.fullName ||
            "Bệnh nhân"
          } • PAT-${patientId}`}
          action={
            <Link
              to="/patient/dashboard"
              className="btn-secondary"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </Link>
          }
        />

        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="saas-card space-y-6"
          >
            {/* ERROR */}
            {error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-4 flex gap-3 text-sm text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-5 h-5 shrink-0" />

                <span>
                  {error}
                </span>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-4 flex gap-3 text-sm text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5 shrink-0" />

                <span>
                  {success}
                </span>
              </div>
            )}

            {/* SPECIALTY */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Chuyên khoa *
              </label>

              <div className="relative">
                <Stethoscope className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

                <select
                  value={specialtyId}
                  onChange={(e) =>
                    setSpecialtyId(
                      e.target.value
                    )
                  }
                  disabled={
                    loadingSpecialties ||
                    submitting
                  }
                  className="input-field pl-9"
                >
                  <option value="">
                    {loadingSpecialties
                      ? "Đang tải chuyên khoa..."
                      : "Chọn chuyên khoa"}
                  </option>

                  {specialties.map(
                    (specialty) => (
                      <option
                        key={
                          specialty.id
                        }
                        value={
                          specialty.id
                        }
                      >
                        {specialty.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* DOCTOR */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Bác sĩ *
              </label>

              <div className="relative">
                <UserRound className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

                <select
                  value={doctorId}
                  onChange={(e) =>
                    setDoctorId(
                      e.target.value
                    )
                  }
                  disabled={
                    !specialtyId ||
                    loadingDoctors ||
                    submitting
                  }
                  className="input-field pl-9"
                >
                  <option value="">
                    {loadingDoctors
                      ? "Đang tải bác sĩ..."
                      : "Chọn bác sĩ"}
                  </option>

                  {doctors.map(
                    (doctor) => (
                      <option
                        key={doctor.id}
                        value={doctor.id}
                      >
                        {doctor.fullName}
                        {doctor.specialization
                          ? ` - ${doctor.specialization}`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              {specialtyId &&
                !loadingDoctors &&
                doctors.length ===
                  0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    Hiện chưa có bác sĩ khả dụng trong chuyên khoa này.
                  </p>
                )}
            </div>

            {/* DATE */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Ngày khám *
              </label>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

                <input
                  type="date"
                  min={today}
                  value={
                    appointmentDate
                  }
                  onChange={(e) =>
                    setAppointmentDate(
                      e.target.value
                    )
                  }
                  disabled={
                    !doctorId ||
                    submitting
                  }
                  className="input-field pl-9"
                />
              </div>
            </div>

            {/* SLOT */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Giờ khám *
              </label>

              {!doctorId ||
              !appointmentDate ? (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-sm text-slate-500 text-center">
                  Chọn bác sĩ và ngày khám để xem giờ còn trống.
                </div>
              ) : loadingSlots ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />

                  Đang kiểm tra lịch trống...
                </div>
              ) : availableSlots.length ===
                0 ? (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4 text-sm text-amber-700 dark:text-amber-300">
                  Bác sĩ không còn khung giờ trống trong ngày này. Hãy chọn ngày khác.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {availableSlots.map(
                    (time) => {
                      const active =
                        selectedTime ===
                        time;

                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() =>
                            setSelectedTime(
                              time
                            )
                          }
                          className={`h-11 rounded-xl border font-bold text-sm flex items-center justify-center gap-1.5 transition ${
                            active
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <Clock className="w-4 h-4" />

                          {time}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* REASON */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Lý do khám / triệu chứng *
              </label>

              <textarea
                rows={4}
                value={reason}
                onChange={(e) =>
                  setReason(
                    e.target.value
                  )
                }
                disabled={submitting}
                placeholder="Ví dụ: đau đầu, chóng mặt trong 3 ngày..."
                className="input-field resize-none"
              />
            </div>

            {/* NOTE */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Ghi chú
              </label>

              <textarea
                rows={2}
                value={note}
                onChange={(e) =>
                  setNote(
                    e.target.value
                  )
                }
                disabled={submitting}
                placeholder="Thông tin bổ sung nếu có..."
                className="input-field resize-none"
              />
            </div>

            {/* SUBMIT */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                to="/patient/dashboard"
                className="btn-secondary flex-1 justify-center"
              >
                Hủy
              </Link>

              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingSlots
                }
                className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />

                    Đang đặt lịch...
                  </>
                ) : (
                  <>
                    <CalendarDays className="w-4 h-4" />

                    Xác nhận đặt lịch
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    );
  };

export default BookAppointment;
