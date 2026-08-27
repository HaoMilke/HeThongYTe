import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import { appointmentService } from "../../services/appointmentService";
import { medicalService } from "../../services/medicalService";
import { prescriptionService } from "../../services/prescriptionService";
import { paymentService } from "../../services/paymentService";
import { patientService } from "../../services/patientService";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  User,
  HeartPulse,
  FileText,
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  History,
  AlertCircle,
  Loader2,
} from "lucide-react";

// =====================================================
// EMPTY PRESCRIPTION ITEM
// =====================================================

const createEmptyMedicineRow = () => ({
  medicineId: "",
  dosage: "",
  frequency: "",
  duration: "",
  quantity: "",
  instructions: "",
});
// Default examination fee used for generated invoices.
const DEFAULT_EXAMINATION_FEE = 250000;

// =====================================================
// HELPERS
// =====================================================

const formatDate = (value) => {
  if (!value) {
    return "---";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "---";
  }

  return date.toLocaleDateString(
    "vi-VN"
  );
};

const getGenderLabel = (
  gender
) => {
  if (!gender) {
    return "---";
  }

  if (
    gender === "MALE"
  ) {
    return "Nam";
  }

  if (
    gender === "FEMALE"
  ) {
    return "Nữ";
  }

  return gender;
};

const toNullableNumber = (
  value
) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : null;
};

const toNullableInteger = (
  value
) => {
  const number =
    toNullableNumber(
      value
    );

  if (number === null) {
    return null;
  }

  return Math.trunc(
    number
  );
};

export const ExaminationPage = () => {
  const {
    appointmentId,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    doctorId,
    doctorProfile,
    user,
  } = useAuth();

  // ===================================================
  // DATA
  // ===================================================

  const [
    appointment,
    setAppointment,
  ] = useState(null);

  const [
    patient,
    setPatient,
  ] = useState(null);

  const [
    historyRecords,
    setHistoryRecords,
  ] = useState([]);

  const [
    medicines,
    setMedicines,
  ] = useState([]);

  // Existing backend records
  const [
    medicalRecordId,
    setMedicalRecordId,
  ] = useState(null);

  const [
    vitalSignId,
    setVitalSignId,
  ] = useState(null);

  const [
    existingPrescriptionId,
    setExistingPrescriptionId,
  ] = useState(null);

  // ===================================================
  // UI STATE
  // ===================================================

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    infoMessage,
    setInfoMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  // ===================================================
  // VITALS
  //
  // Không hard-code 120/80, 75...
  // ===================================================

  const [
    vitals,
    setVitals,
  ] = useState({
    systolicPressure: "",
    diastolicPressure: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
    notes: "",
  });

  // ===================================================
  // MEDICAL RECORD
  // ===================================================

  const [
    record,
    setRecord,
  ] = useState({
    symptoms: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  });

  // ===================================================
  // PRESCRIPTION
  // ===================================================

  const [
    prescriptionItems,
    setPrescriptionItems,
  ] = useState([
    createEmptyMedicineRow(),
  ]);

  // ===================================================
  // MEDICINES AVAILABLE
  // ===================================================

  const activeMedicines =
    useMemo(() => {
      return medicines.filter(
        (medicine) =>
          medicine?.active !==
          false
      );
    }, [medicines]);

  const prescriptionLocked =
    Boolean(
      existingPrescriptionId
    );

  // ===================================================
  // LOAD EXISTING MEDICAL DATA
  //
  // Hữu ích nếu:
  // - Appointment đã COMPLETED
  // - một bước trước đã lưu thành công
  // - bước sau bị lỗi
  //
  // Khi user thử lại sẽ không tạo duplicate.
  // ===================================================

  const loadExistingMedicalData =
    useCallback(
      async () => {
        try {
          const existingRecord =
            await medicalService
              .getRecordByAppointment(
                appointmentId
              );

          if (
            !existingRecord?.id
          ) {
            return;
          }

          setMedicalRecordId(
            existingRecord.id
          );

          setRecord({
            symptoms:
              existingRecord.symptoms ||
              "",

            diagnosis:
              existingRecord.diagnosis ||
              "",

            treatment:
              existingRecord.treatment ||
              "",

            notes:
              existingRecord.notes ||
              "",
          });

          // -----------------------------------------
          // LOAD VITAL SIGNS
          // -----------------------------------------

          try {
            const vitalList =
              await medicalService
                .getVitalSignsByMedicalRecord(
                  existingRecord.id
                );

            const list =
              Array.isArray(
                vitalList
              )
                ? vitalList
                : [];

            if (
              list.length > 0
            ) {
              const latest =
                list[0];

              setVitalSignId(
                latest.id
              );

              setVitals({
                systolicPressure:
                  latest.systolicPressure ??
                  "",

                diastolicPressure:
                  latest.diastolicPressure ??
                  "",

                heartRate:
                  latest.heartRate ??
                  "",

                temperature:
                  latest.temperature ??
                  "",

                weight:
                  latest.weight ??
                  "",

                height:
                  latest.height ??
                  "",

                notes:
                  latest.notes ||
                  "",
              });
            }
          } catch (vitalError) {
            console.warn(
              "Không tải được sinh hiệu:",
              vitalError
            );
          }

          // -----------------------------------------
          // LOAD PRESCRIPTION
          // -----------------------------------------

          try {
            const prescription =
              await prescriptionService
                .getByMedicalRecordId(
                  existingRecord.id
                );

            if (
              prescription?.id
            ) {
              setExistingPrescriptionId(
                prescription.id
              );

              const items =
                Array.isArray(
                  prescription.items
                )
                  ? prescription.items
                  : [];

              if (
                items.length > 0
              ) {
                setPrescriptionItems(
                  items.map(
                    (item) => ({
                      medicineId:
                        item.medicineId ??
                        "",

                      dosage:
                        item.dosage ||
                        "",

                      frequency:
                        item.frequency ||
                        "",

                      duration:
                        item.duration ||
                        "",

                      quantity:
                        item.quantity ??
                        "",

                      instructions:
                        item.instructions ||
                        "",
                    })
                  )
                );
              }
            }
          } catch (prescriptionError) {
            /*
             * Chưa có đơn thuốc là bình thường.
             */
            console.info(
              "Medical Record chưa có Prescription."
            );
          }
        } catch (recordError) {
          /*
           * EXAMINING chưa có MedicalRecord là bình thường.
           *
           * COMPLETED nhưng chưa có record có thể là
           * lần lưu trước bị lỗi giữa chừng.
           */
          console.info(
            "Appointment chưa có Medical Record."
          );
        }
      },
      [appointmentId]
    );

  // ===================================================
  // INITIAL DATA
  // ===================================================

  const initializePage =
    useCallback(
      async () => {
        setLoading(true);
        setError("");
        setInfoMessage("");

        if (!doctorId) {
          setError(
            "Tài khoản hiện tại chưa có hồ sơ bác sĩ."
          );

          setLoading(false);
          return;
        }

        try {
          // -----------------------------------------
          // 1. APPOINTMENT
          // -----------------------------------------

          const app =
            await appointmentService
              .getAppointmentById(
                appointmentId
              );

          if (!app?.id) {
            throw new Error(
              "Không tìm thấy lịch khám."
            );
          }

          // -----------------------------------------
          // OWNERSHIP CHECK FRONTEND
          // Backend vẫn kiểm tra thật.
          // -----------------------------------------

          if (
            Number(
              app.doctorId
            ) !==
            Number(
              doctorId
            )
          ) {
            throw new Error(
              "Bạn không có quyền khám lịch hẹn của bác sĩ khác."
            );
          }

          // -----------------------------------------
          // Chỉ mở phòng khám khi:
          //
          // EXAMINING:
          //   khám bình thường
          //
          // COMPLETED:
          //   cho phép phục hồi nếu lần lưu trước
          //   bị lỗi giữa các microservice.
          // -----------------------------------------

          if (
            ![
              "EXAMINING",
              "COMPLETED",
            ].includes(
              app.status
            )
          ) {
            if (
              app.status ===
              "WAITING"
            ) {
              throw new Error(
                "Ca khám đang WAITING. Hãy bấm 'Bắt đầu khám' từ Dashboard trước."
              );
            }

            throw new Error(
              `Không thể mở phòng khám khi lịch đang ở trạng thái ${app.status}.`
            );
          }

          setAppointment(
            app
          );

          setRecord(
            (current) => ({
              ...current,

              symptoms:
                current.symptoms ||
                app.reason ||
                "",
            })
          );

          // -----------------------------------------
          // 2. PATIENT + HISTORY + MEDICINES
          // -----------------------------------------

          const results =
            await Promise.allSettled([
              patientService
                .getPatientById(
                  app.patientId
                ),

              medicalService
                .getRecordsByDoctor(
                  doctorId
                ),

              prescriptionService
                .getAllMedicines(),
            ]);

          const [
            patientResult,
            historyResult,
            medicineResult,
          ] = results;

          // Patient profile là dữ liệu quan trọng.
          if (
            patientResult.status ===
            "rejected"
          ) {
            throw new Error(
              "Không thể tải hồ sơ bệnh nhân."
            );
          }

          setPatient(
            patientResult.value
          );

          if (
            historyResult.status ===
            "fulfilled"
          ) {
            setHistoryRecords(
              Array.isArray(
                historyResult.value
              )
                ? historyResult.value.filter(
                    (item) =>
                      Number(item.patientId) ===
                      Number(app.patientId)
                  )
                : []
            );
          } else {
            setHistoryRecords(
              []
            );
          }

          if (
            medicineResult.status ===
            "fulfilled"
          ) {
            setMedicines(
              Array.isArray(
                medicineResult.value
              )
                ? medicineResult.value
                : []
            );
          } else {
            setMedicines(
              []
            );

            setInfoMessage(
              "Không tải được danh mục thuốc. Bạn vẫn có thể hoàn tất ca khám mà không kê đơn."
            );
          }

          // -----------------------------------------
          // 3. Nếu appointment đã COMPLETED
          // hoặc có dữ liệu dở dang thì load lại.
          // -----------------------------------------

          await loadExistingMedicalData();
        } catch (err) {
          console.error(
            "Initialize examination failed:",
            err
          );

          setError(
            err?.message ||
              "Không thể tải phòng khám."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        appointmentId,
        doctorId,
        loadExistingMedicalData,
      ]
    );

  useEffect(() => {
    initializePage();
  }, [initializePage]);

  // ===================================================
  // PRESCRIPTION HANDLERS
  // ===================================================

  const handleAddMedicineRow =
    () => {
      if (
        prescriptionLocked
      ) {
        return;
      }

      setPrescriptionItems(
        (current) => [
          ...current,
          createEmptyMedicineRow(),
        ]
      );
    };

  const handleRemoveMedicineRow =
    (index) => {
      if (
        prescriptionLocked
      ) {
        return;
      }

      setPrescriptionItems(
        (current) =>
          current.filter(
            (_, itemIndex) =>
              itemIndex !== index
          )
      );
    };

  const handleMedicineChange = (
    index,
    field,
    value
  ) => {
    if (
      prescriptionLocked
    ) {
      return;
    }

    setPrescriptionItems(
      (current) =>
        current.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        )
    );
  };

  // ===================================================
  // VALIDATE VITALS
  // ===================================================

  const validateVitals =
    () => {
      const systolic =
        toNullableInteger(
          vitals.systolicPressure
        );

      const diastolic =
        toNullableInteger(
          vitals.diastolicPressure
        );

      const heartRate =
        toNullableInteger(
          vitals.heartRate
        );

      const temperature =
        toNullableNumber(
          vitals.temperature
        );

      const weight =
        toNullableNumber(
          vitals.weight
        );

      const height =
        toNullableNumber(
          vitals.height
        );

      if (
        systolic !== null &&
        (
          systolic < 50 ||
          systolic > 250
        )
      ) {
        return "Huyết áp tâm thu phải từ 50 đến 250 mmHg.";
      }

      if (
        diastolic !== null &&
        (
          diastolic < 30 ||
          diastolic > 150
        )
      ) {
        return "Huyết áp tâm trương phải từ 30 đến 150 mmHg.";
      }

      if (
        systolic !== null &&
        diastolic !== null &&
        systolic <= diastolic
      ) {
        return "Huyết áp tâm thu phải lớn hơn huyết áp tâm trương.";
      }

      if (
        heartRate !== null &&
        (
          heartRate < 20 ||
          heartRate > 250
        )
      ) {
        return "Nhịp tim không hợp lệ.";
      }

      if (
        temperature !== null &&
        (
          temperature < 30 ||
          temperature > 45
        )
      ) {
        return "Nhiệt độ phải từ 30°C đến 45°C.";
      }

      if (
        weight !== null &&
        (
          weight <= 0 ||
          weight > 500
        )
      ) {
        return "Cân nặng không hợp lệ.";
      }

      if (
        height !== null &&
        (
          height < 30 ||
          height > 250
        )
      ) {
        return "Chiều cao phải từ 30 đến 250 cm.";
      }

      return null;
    };

  // ===================================================
  // HAS VITAL DATA
  // ===================================================

  const hasVitalData = () => {
    return Boolean(
      vitals.systolicPressure !== "" ||
      vitals.diastolicPressure !== "" ||
      vitals.heartRate !== "" ||
      vitals.temperature !== "" ||
      vitals.weight !== "" ||
      vitals.height !== "" ||
      vitals.notes.trim()
    );
  };

  // ===================================================
  // COMPLETE EXAM
  //
  // Backend hiện tại:
  //
  // EXAMINING
  //      ↓
  // COMPLETED
  //      ↓
  // Medical Record
  //      ↓
  // Vital Sign
  //      ↓
  // Prescription
  //
  // Không dùng catch(() => fake success).
  // ===================================================

  const handleCompleteExam =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccessMessage("");

      if (
        !appointment
      ) {
        setError(
          "Không có thông tin lịch khám."
        );

        return;
      }

      if (
        !doctorId
      ) {
        setError(
          "Không xác định được bác sĩ."
        );

        return;
      }

      if (
        !record.diagnosis.trim()
      ) {
        setError(
          "Vui lòng nhập chẩn đoán chính."
        );

        return;
      }

      const vitalError =
        validateVitals();

      if (
        vitalError
      ) {
        setError(
          vitalError
        );

        return;
      }

      // -----------------------------------------------
      // Chỉ lấy những dòng thực sự đã chọn thuốc.
      // Dòng trống được bỏ qua.
      // -----------------------------------------------

      const selectedMedicines =
        prescriptionItems.filter(
          (item) =>
            Boolean(
              item.medicineId
            )
        );

      for (
        const item
        of selectedMedicines
      ) {
        const quantity =
          Number(
            item.quantity
          );

        if (
          !Number.isInteger(
            quantity
          ) ||
          quantity <= 0
        ) {
          setError(
            "Số lượng thuốc phải là số nguyên lớn hơn 0."
          );

          return;
        }
      }

            // Build invoice details: consultation fee + selected medicines.
      const invoiceItems = [
        {
          itemType: "EXAMINATION",
          description: "Phí khám bệnh",
          quantity: 1,
          unitPrice: DEFAULT_EXAMINATION_FEE,
        },
      ];

      for (const item of selectedMedicines) {
        const medicine = medicines.find(
          (candidate) =>
            Number(candidate.id) === Number(item.medicineId)
        );

        const unitPrice = Number(medicine?.price);

        if (
          !medicine ||
          !Number.isFinite(unitPrice) ||
          unitPrice < 0
        ) {
          setError(
            `Không xác định được giá của thuốc #${item.medicineId}.`
          );
          return;
        }

        invoiceItems.push({
          itemType: "MEDICINE",
          description:
            medicine.name || `Thuốc #${item.medicineId}`,
          quantity: Number(item.quantity),
          unitPrice,
        });
      }
setSaving(true);

      /*
       * currentAppointment dùng để biết
       * bước complete đã chạy thành công hay chưa.
       */
      let currentAppointment =
        appointment;

      try {
        // =============================================
        // STEP 1
        // EXAMINING -> COMPLETED
        // =============================================

        if (
          currentAppointment.status ===
          "EXAMINING"
        ) {
          currentAppointment =
            await appointmentService
              .completeAppointment(
                appointmentId
              );

          setAppointment(
            currentAppointment
          );
        }

        if (
          currentAppointment?.status !==
          "COMPLETED"
        ) {
          throw new Error(
            "Không thể chuyển lịch khám sang COMPLETED."
          );
        }

        // =============================================
        // STEP 2
        // CREATE / UPDATE MEDICAL RECORD
        // =============================================

        let savedRecord;

        const medicalPayload = {
          symptoms:
            record.symptoms.trim(),

          diagnosis:
            record.diagnosis.trim(),

          treatment:
            record.treatment.trim(),

          notes:
            record.notes.trim(),
        };

        if (
          medicalRecordId
        ) {
          savedRecord =
            await medicalService
              .updateMedicalRecord(
                medicalRecordId,
                medicalPayload
              );
        } else {
          savedRecord =
            await medicalService
              .createMedicalRecord({
                appointmentId:
                  Number(
                    appointmentId
                  ),

                patientId:
                  Number(
                    appointment.patientId
                  ),

                doctorId:
                  Number(
                    doctorId
                  ),

                ...medicalPayload,
              });

          if (
            !savedRecord?.id
          ) {
            throw new Error(
              "Backend không trả Medical Record ID."
            );
          }

          setMedicalRecordId(
            savedRecord.id
          );
        }

        const finalRecordId =
          savedRecord?.id ||
          medicalRecordId;

        if (
          !finalRecordId
        ) {
          throw new Error(
            "Không xác định được Medical Record ID."
          );
        }

        // =============================================
        // STEP 3
        // CREATE / UPDATE VITAL SIGN
        //
        // Vital Sign chỉ tạo nếu bác sĩ
        // thực sự nhập dữ liệu.
        // =============================================

        if (
          hasVitalData()
        ) {
          const vitalPayload = {
            medicalRecordId:
              Number(
                finalRecordId
              ),

            systolicPressure:
              toNullableInteger(
                vitals.systolicPressure
              ),

            diastolicPressure:
              toNullableInteger(
                vitals.diastolicPressure
              ),

            heartRate:
              toNullableInteger(
                vitals.heartRate
              ),

            temperature:
              toNullableNumber(
                vitals.temperature
              ),

            weight:
              toNullableNumber(
                vitals.weight
              ),

            height:
              toNullableNumber(
                vitals.height
              ),

            notes:
              vitals.notes.trim(),
          };

          if (
            vitalSignId
          ) {
            await medicalService
              .updateVitalSign(
                vitalSignId,
                vitalPayload
              );
          } else {
            const savedVital =
              await medicalService
                .createVitalSign(
                  vitalPayload
                );

            if (
              savedVital?.id
            ) {
              setVitalSignId(
                savedVital.id
              );
            }
          }
        }

        // =============================================
        // STEP 4
        // PRESCRIPTION
        //
        // Backend yêu cầu:
        // medicalRecordId
        // patientId
        // doctorId
        // items[]
        //
        // item:
        // medicineId
        // quantity > 0
        // =============================================

        if (
          selectedMedicines.length >
            0 &&
          !existingPrescriptionId
        ) {
          const savedPrescription =
            await prescriptionService
              .createPrescription({
                medicalRecordId:
                  Number(
                    finalRecordId
                  ),

                patientId:
                  Number(
                    appointment.patientId
                  ),

                doctorId:
                  Number(
                    doctorId
                  ),

                notes:
                  `Đơn thuốc cho lịch khám APP-${appointmentId}`,

                items:
                  selectedMedicines.map(
                    (item) => ({
                      medicineId:
                        Number(
                          item.medicineId
                        ),

                      dosage:
                        item.dosage.trim(),

                      frequency:
                        item.frequency.trim(),

                      duration:
                        item.duration.trim(),

                      quantity:
                        Number(
                          item.quantity
                        ),

                      instructions:
                        item.instructions.trim(),
                    })
                  ),
              });

          if (
            savedPrescription?.id
          ) {
            setExistingPrescriptionId(
              savedPrescription.id
            );
          }
        }

        // =============================================
        // STEP 5
        // CREATE / REUSE INVOICE
        // =============================================

        const savedInvoice =
          await paymentService.createInvoice({
            appointmentId: Number(appointmentId),
            patientId: Number(appointment.patientId),
            notes: `Hóa đơn cho lịch khám APP-${appointmentId}`,
            items: invoiceItems,
          });
        // =============================================
        // SUCCESS
        // =============================================

        setSuccessMessage(
          savedInvoice?.id
            ? `Đã hoàn tất ca khám và tạo hóa đơn INV-${savedInvoice.id}.`
            : "Đã hoàn tất ca khám và tạo hóa đơn thanh toán."
        );

        window.setTimeout(
          () => {
            navigate(
              "/doctor/dashboard"
            );
          },
          1400
        );
      } catch (err) {
        console.error(
          "Complete examination failed:",
          err
        );

        /*
         * Nếu Appointment đã COMPLETED nhưng
         * Medical/Vital/Prescription gặp lỗi,
         * KHÔNG fake success.
         *
         * User có thể sửa dữ liệu rồi bấm lại.
         */
        if (
          currentAppointment?.status ===
          "COMPLETED"
        ) {
          setError(
            `${
              err?.message ||
              "Không thể lưu đầy đủ hồ sơ khám."
            } Lịch khám đã ở trạng thái COMPLETED; bạn có thể sửa dữ liệu và bấm Hoàn tất lại để tiếp tục lưu phần còn thiếu.`
          );
        } else {
          setError(
            err?.message ||
              "Không thể hoàn tất ca khám."
          );
        }
      } finally {
        setSaving(false);
      }
    };

  // ===================================================
  // LOADING
  // ===================================================

  if (
    loading
  ) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />

            Đang tải phòng khám...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* =========================================== */}
        {/* HEADER */}
        {/* =========================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/doctor/dashboard"
              )
            }
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-bold w-fit"
          >
            <ArrowLeft className="w-4 h-4" />

            Quay Lại Dashboard
          </button>

          <div className="text-right">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Phòng khám -{" "}
              {doctorProfile?.fullName ||
                user?.fullName ||
                "Bác sĩ"}
            </div>

            <div className="small-text font-mono">
              APP-
              {appointmentId}

              {appointment?.status &&
                ` | ${appointment.status}`}
            </div>
          </div>
        </div>

        {/* =========================================== */}
        {/* ERROR */}
        {/* =========================================== */}

        {error && (
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

            <span>
              {error}
            </span>
          </div>
        )}

        {/* =========================================== */}
        {/* INFO */}
        {/* =========================================== */}

        {infoMessage && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm">
            {infoMessage}
          </div>
        )}

        {/* =========================================== */}
        {/* SUCCESS */}
        {/* =========================================== */}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />

            {
              successMessage
            }
          </div>
        )}

        {appointment && (
          <form
            onSubmit={
              handleCompleteExam
            }
            className="space-y-8"
          >
            {/* ======================================= */}
            {/* PATIENT + HISTORY */}
            {/* ======================================= */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="saas-card space-y-4">
                <h3 className="card-title flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />

                  Thông Tin Bệnh Nhân
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="small-text block">
                      Họ và tên
                    </span>

                    <strong>
                      {patient?.fullName ||
                        "---"}
                    </strong>
                  </div>

                  <div>
                    <span className="small-text block">
                      Mã bệnh nhân
                    </span>

                    <strong className="font-mono text-blue-600">
                      PAT-
                      {
                        appointment.patientId
                      }
                    </strong>
                  </div>

                  <div>
                    <span className="small-text block">
                      Số điện thoại
                    </span>

                    <span>
                      {patient?.phone ||
                        patient?.phoneNumber ||
                        "---"}
                    </span>
                  </div>

                  <div>
                    <span className="small-text block">
                      Ngày sinh
                    </span>

                    <span>
                      {formatDate(
                        patient?.dateOfBirth ||
                          patient?.dob
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="small-text block">
                      Giới tính
                    </span>

                    <span>
                      {getGenderLabel(
                        patient?.gender
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="small-text block">
                      Lý do đặt lịch
                    </span>

                    <span>
                      {appointment.reason ||
                        "---"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="saas-card space-y-4">
                <h3 className="card-title flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-500" />

                  Tiền Sử Bệnh Án
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {historyRecords.length ===
                  0 ? (
                    <p className="small-text italic">
                      Bệnh nhân chưa có bệnh án trước đó.
                    </p>
                  ) : (
                    historyRecords.map(
                      (
                        history
                      ) => (
                        <div
                          key={
                            history.id
                          }
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        >
                          <div className="font-bold text-sm">
                            {history.diagnosis ||
                              "Chưa có chẩn đoán"}
                          </div>

                          <div className="small-text mt-1">
                            {formatDate(
                              history.examinationDate ||
                                history.createdAt
                            )}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            </div>

            {/* ======================================= */}
            {/* VITAL SIGNS */}
            {/* ======================================= */}

            <div className="saas-card space-y-5 border border-emerald-500/20">
              <h3 className="card-title flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-500" />

                1. Chỉ Số Sinh Hiệu
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Tâm thu
                  </label>

                  <input
                    type="number"
                    value={
                      vitals.systolicPressure
                    }
                    onChange={(event) =>
                      setVitals(
                        (current) => ({
                          ...current,

                          systolicPressure:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="120"
                    className="input-field"
                  />

                  <span className="small-text">
                    mmHg
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Tâm trương
                  </label>

                  <input
                    type="number"
                    value={
                      vitals.diastolicPressure
                    }
                    onChange={(event) =>
                      setVitals(
                        (current) => ({
                          ...current,

                          diastolicPressure:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="80"
                    className="input-field"
                  />

                  <span className="small-text">
                    mmHg
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Nhịp tim
                  </label>

                  <input
                    type="number"
                    value={
                      vitals.heartRate
                    }
                    onChange={(event) =>
                      setVitals(
                        (current) => ({
                          ...current,

                          heartRate:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="75"
                    className="input-field"
                  />

                  <span className="small-text">
                    nhịp/phút
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Nhiệt độ
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    value={
                      vitals.temperature
                    }
                    onChange={(event) =>
                      setVitals(
                        (current) => ({
                          ...current,

                          temperature:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="36.8"
                    className="input-field"
                  />

                  <span className="small-text">
                    °C
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Cân nặng
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    value={
                      vitals.weight
                    }
                    onChange={(event) =>
                      setVitals(
                        (current) => ({
                          ...current,

                          weight:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="65"
                    className="input-field"
                  />

                  <span className="small-text">
                    kg
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Chiều cao
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    value={
                      vitals.height
                    }
                    onChange={(event) =>
                      setVitals(
                        (current) => ({
                          ...current,

                          height:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="170"
                    className="input-field"
                  />

                  <span className="small-text">
                    cm
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Ghi chú sinh hiệu
                </label>

                <textarea
                  rows={2}
                  value={
                    vitals.notes
                  }
                  onChange={(event) =>
                    setVitals(
                      (current) => ({
                        ...current,

                        notes:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="input-field resize-none"
                  placeholder="Ghi chú nếu cần..."
                />
              </div>
            </div>

            {/* ======================================= */}
            {/* MEDICAL RECORD */}
            {/* ======================================= */}

            <div className="saas-card space-y-5">
              <h3 className="card-title flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />

                2. Kết Quả Khám & Chẩn Đoán
              </h3>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Chẩn đoán chính *
                </label>

                <input
                  type="text"
                  required
                  value={
                    record.diagnosis
                  }
                  onChange={(event) =>
                    setRecord(
                      (current) => ({
                        ...current,

                        diagnosis:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="Ví dụ: Viêm họng cấp"
                  className="input-field font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Triệu chứng lâm sàng
                  </label>

                  <textarea
                    rows={4}
                    value={
                      record.symptoms
                    }
                    onChange={(event) =>
                      setRecord(
                        (current) => ({
                          ...current,

                          symptoms:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Điều trị / hướng xử lý
                  </label>

                  <textarea
                    rows={4}
                    value={
                      record.treatment
                    }
                    onChange={(event) =>
                      setRecord(
                        (current) => ({
                          ...current,

                          treatment:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="Phác đồ điều trị, theo dõi..."
                    className="input-field resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Lời dặn & ghi chú
                </label>

                <textarea
                  rows={3}
                  value={
                    record.notes
                  }
                  onChange={(event) =>
                    setRecord(
                      (current) => ({
                        ...current,

                        notes:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="Nghỉ ngơi, tái khám..."
                  className="input-field resize-none"
                />
              </div>
            </div>

            {/* ======================================= */}
            {/* PRESCRIPTION */}
            {/* ======================================= */}

            <div className="saas-card space-y-5 border border-purple-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="card-title flex items-center gap-2">
                    <Pill className="w-5 h-5 text-purple-500" />

                    3. Kê Đơn Thuốc
                  </h3>

                  <p className="small-text mt-1">
                    Có thể để trống nếu ca khám không cần kê thuốc.
                  </p>
                </div>

                {!prescriptionLocked && (
                  <button
                    type="button"
                    onClick={
                      handleAddMedicineRow
                    }
                    className="btn-secondary text-xs px-3 py-2 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />

                    Thêm Thuốc
                  </button>
                )}
              </div>

              {prescriptionLocked && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  Đơn thuốc đã được lưu. Màn hình này không tạo thêm đơn thuốc thứ hai cho cùng bệnh án.
                </div>
              )}

              {activeMedicines.length ===
                0 &&
                !prescriptionLocked && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs">
                    Không có thuốc khả dụng. Bạn vẫn có thể hoàn tất khám mà không kê đơn.
                  </div>
                )}

              <div className="space-y-4">
                {prescriptionItems.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold mb-1">
                            Thuốc
                          </label>

                          <select
                            disabled={
                              prescriptionLocked
                            }
                            value={
                              item.medicineId
                            }
                            onChange={(event) =>
                              handleMedicineChange(
                                index,
                                "medicineId",
                                event.target
                                  .value
                              )
                            }
                            className="input-field"
                          >
                            <option value="">
                              -- Không chọn thuốc --
                            </option>

                            {activeMedicines.map(
                              (
                                medicine
                              ) => (
                                <option
                                  key={
                                    medicine.id
                                  }
                                  value={
                                    medicine.id
                                  }
                                  disabled={
                                    medicine.stockQuantity !==
                                      undefined &&
                                    Number(
                                      medicine.stockQuantity
                                    ) <= 0
                                  }
                                >
                                  {
                                    medicine.name
                                  }

                                  {medicine.unit
                                    ? ` - ${medicine.unit}`
                                    : ""}

                                  {medicine.stockQuantity !==
                                  undefined
                                    ? ` (Tồn: ${medicine.stockQuantity})`
                                    : ""}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold mb-1">
                            Liều dùng
                          </label>

                          <input
                            disabled={
                              prescriptionLocked
                            }
                            type="text"
                            value={
                              item.dosage
                            }
                            onChange={(event) =>
                              handleMedicineChange(
                                index,
                                "dosage",
                                event.target
                                  .value
                              )
                            }
                            placeholder="1 viên/lần"
                            className="input-field"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold mb-1">
                            Tần suất
                          </label>

                          <input
                            disabled={
                              prescriptionLocked
                            }
                            type="text"
                            value={
                              item.frequency
                            }
                            onChange={(event) =>
                              handleMedicineChange(
                                index,
                                "frequency",
                                event.target
                                  .value
                              )
                            }
                            placeholder="2 lần/ngày"
                            className="input-field"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold mb-1">
                            Thời gian dùng
                          </label>

                          <input
                            disabled={
                              prescriptionLocked
                            }
                            type="text"
                            value={
                              item.duration
                            }
                            onChange={(event) =>
                              handleMedicineChange(
                                index,
                                "duration",
                                event.target
                                  .value
                              )
                            }
                            placeholder="5 ngày"
                            className="input-field"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold mb-1">
                            Số lượng
                          </label>

                          <input
                            disabled={
                              prescriptionLocked
                            }
                            type="number"
                            min="1"
                            value={
                              item.quantity
                            }
                            onChange={(event) =>
                              handleMedicineChange(
                                index,
                                "quantity",
                                event.target
                                  .value
                              )
                            }
                            placeholder="10"
                            className="input-field"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold mb-1">
                            Hướng dẫn
                          </label>

                          <input
                            disabled={
                              prescriptionLocked
                            }
                            type="text"
                            value={
                              item.instructions
                            }
                            onChange={(event) =>
                              handleMedicineChange(
                                index,
                                "instructions",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Uống sau ăn"
                            className="input-field"
                          />
                        </div>
                      </div>

                      {!prescriptionLocked &&
                        prescriptionItems.length >
                          1 && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveMedicineRow(
                                  index
                                )
                              }
                              className="text-xs text-rose-600 font-bold flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />

                              Xóa dòng thuốc
                            </button>
                          </div>
                        )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* ======================================= */}
            {/* ACTION */}
            {/* ======================================= */}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={
                  saving
                }
                onClick={() =>
                  navigate(
                    "/doctor/dashboard"
                  )
                }
                className="btn-secondary w-full sm:w-auto px-6 py-3"
              >
                Quay Lại
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  Boolean(
                    successMessage
                  )
                }
                className="btn-primary flex-1 w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />

                    Đang lưu dữ liệu...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />

                    Hoàn Tất Khám & Lưu Hồ Sơ
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExaminationPage;
