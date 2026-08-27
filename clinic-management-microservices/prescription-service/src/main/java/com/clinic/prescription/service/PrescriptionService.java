package com.clinic.prescription.service;

import com.clinic.prescription.client.MedicalRecordClient;
import com.clinic.prescription.dto.MedicalRecordResponse;
import com.clinic.prescription.entity.Medicine;
import com.clinic.prescription.entity.Prescription;
import com.clinic.prescription.entity.PrescriptionItem;
import com.clinic.prescription.repository.MedicineRepository;
import com.clinic.prescription.repository.PrescriptionRepository;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.clinic.prescription.client.PatientClient;

import java.util.List;

import com.clinic.prescription.client.DoctorClient;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final MedicineRepository medicineRepository;
    private final MedicalRecordClient medicalRecordClient;
    private final PatientClient patientClient;
    private final DoctorClient doctorClient;

   public PrescriptionService(
        PrescriptionRepository prescriptionRepository,
        MedicineRepository medicineRepository,
        MedicalRecordClient medicalRecordClient,
        PatientClient patientClient,
        DoctorClient doctorClient
) {
    this.prescriptionRepository =
            prescriptionRepository;

    this.medicineRepository =
            medicineRepository;

    this.medicalRecordClient =
            medicalRecordClient;

    this.patientClient =
            patientClient;

    this.doctorClient =
            doctorClient;
}
    @Transactional
    public Prescription createPrescription(
            Prescription prescription
    ) {

        if (prescription.getMedicalRecordId() == null) {
            throw new RuntimeException(
                    "Medical Record ID không được để trống"
            );
        }

        if (prescription.getPatientId() == null) {
            throw new RuntimeException(
                    "Patient ID không được để trống"
            );
        }

        if (prescription.getDoctorId() == null) {
            throw new RuntimeException(
                    "Doctor ID không được để trống"
            );
        }

        if (prescriptionRepository
                .existsByMedicalRecordId(
                        prescription.getMedicalRecordId()
                )) {

            throw new RuntimeException(
                    "Hồ sơ bệnh án này đã có đơn thuốc"
            );
        }

        MedicalRecordResponse medicalRecord =
                medicalRecordClient.getMedicalRecord(
                        prescription.getMedicalRecordId()
                );

        if (!prescription.getPatientId().equals(
                medicalRecord.getPatientId()
        )) {
            throw new RuntimeException(
                    "Patient ID không khớp với hồ sơ bệnh án"
            );
        }

        if (!prescription.getDoctorId().equals(
                medicalRecord.getDoctorId()
        )) {
            throw new RuntimeException(
                    "Doctor ID không khớp với hồ sơ bệnh án"
            );
        }

        if (prescription.getItems() == null
                || prescription.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Đơn thuốc phải có ít nhất một thuốc"
            );
        }

        for (PrescriptionItem item
                : prescription.getItems()) {

            validateItem(item);

            Medicine medicine =
                    getMedicineForPrescription(
                            item.getMedicineId()
                    );

            if (medicine.getStockQuantity()
                    < item.getQuantity()) {

                throw new RuntimeException(
                        "Thuốc "
                                + medicine.getName()
                                + " không đủ tồn kho"
                );
            }

            item.setMedicineName(
                    medicine.getName()
            );

            item.setId(null);

            item.setPrescription(
                    prescription
            );
        }

        for (PrescriptionItem item
                : prescription.getItems()) {

            Medicine medicine =
                    getMedicineForPrescription(
                            item.getMedicineId()
                    );

            medicine.setStockQuantity(
                    medicine.getStockQuantity()
                            - item.getQuantity()
            );

            medicineRepository.save(
                    medicine
            );
        }

        prescription.setId(null);

        return prescriptionRepository.save(
                prescription
        );
    }

    private Medicine getMedicineForPrescription(
            Long medicineId
    ) {

        Medicine medicine =
                medicineRepository
                        .findById(medicineId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy thuốc"
                                )
                        );

        if (!Boolean.TRUE.equals(
                medicine.getActive()
        )) {
            throw new RuntimeException(
                    "Thuốc "
                            + medicine.getName()
                            + " đã ngừng sử dụng"
            );
        }

        return medicine;
    }

    private void validateItem(
            PrescriptionItem item
    ) {

        if (item == null) {
            throw new RuntimeException(
                    "Thông tin thuốc không hợp lệ"
            );
        }

        if (item.getMedicineId() == null) {
            throw new RuntimeException(
                    "Medicine ID không được để trống"
            );
        }

        if (item.getQuantity() == null
                || item.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Số lượng thuốc phải lớn hơn 0"
            );
        }
    }

    public Prescription getById(
            Long id
    ) {

        return prescriptionRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy đơn thuốc"
                        )
                );
    }

    public Prescription getByMedicalRecordId(
            Long medicalRecordId
    ) {

        return prescriptionRepository
                .findByMedicalRecordId(
                        medicalRecordId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy đơn thuốc"
                        )
                );
    }

    public List<Prescription> getByPatientId(
            Long patientId
    ) {
        return prescriptionRepository
                .findByPatientId(
                        patientId
                );
    }

    public List<Prescription> getByDoctorId(
            Long doctorId
    ) {
        return prescriptionRepository
                .findByDoctorId(
                        doctorId
                );
    }

    public List<Prescription> getAll() {
        return prescriptionRepository
                .findAll();
    }

    public Long getAuthenticatedPatientId(
        Long authenticatedUserId
) {

    if (authenticatedUserId == null) {
        throw new RuntimeException(
                "Không xác định được người dùng hiện tại"
        );
    }

    return patientClient
            .getPatientIdByUserId(
                    authenticatedUserId
            );
}

public Prescription getOwnedPrescriptionById(
        Long prescriptionId,
        Long authenticatedUserId
) {

    Long patientId =
            getAuthenticatedPatientId(
                    authenticatedUserId
            );

    Prescription prescription =
            getById(
                    prescriptionId
            );

    if (!patientId.equals(
            prescription.getPatientId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền truy cập đơn thuốc này"
        );
    }

    return prescription;
}

public Prescription getOwnedPrescriptionByMedicalRecordId(
        Long medicalRecordId,
        Long authenticatedUserId
) {

    Prescription prescription =
            getByMedicalRecordId(
                    medicalRecordId
            );

    Long patientId =
            getAuthenticatedPatientId(
                    authenticatedUserId
            );

    if (!patientId.equals(
            prescription.getPatientId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền truy cập đơn thuốc này"
        );
    }

    return prescription;
}

public List<Prescription> getOwnedPrescriptions(
        Long authenticatedUserId
) {

    Long patientId =
            getAuthenticatedPatientId(
                    authenticatedUserId
            );

    return getByPatientId(
            patientId
    );
}

public Long getAuthenticatedDoctorId(
        Long authenticatedUserId
) {

    if (authenticatedUserId == null) {
        throw new RuntimeException(
                "Không xác định được người dùng hiện tại"
        );
    }

    return doctorClient
            .getDoctorIdByUserId(
                    authenticatedUserId
            );
}

public Prescription getDoctorOwnedPrescriptionById(
        Long prescriptionId,
        Long authenticatedUserId
) {

    Long doctorId =
            getAuthenticatedDoctorId(
                    authenticatedUserId
            );

    Prescription prescription =
            getById(
                    prescriptionId
            );

    if (!doctorId.equals(
            prescription.getDoctorId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền truy cập đơn thuốc của bác sĩ khác"
        );
    }

    return prescription;
}

public Prescription getDoctorOwnedPrescriptionByMedicalRecordId(
        Long medicalRecordId,
        Long authenticatedUserId
) {

    Prescription prescription =
            getByMedicalRecordId(
                    medicalRecordId
            );

    Long doctorId =
            getAuthenticatedDoctorId(
                    authenticatedUserId
            );

    if (!doctorId.equals(
            prescription.getDoctorId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền truy cập đơn thuốc của bác sĩ khác"
        );
    }

    return prescription;
}

public List<Prescription> getDoctorOwnedPrescriptions(
        Long authenticatedUserId
) {

    Long doctorId =
            getAuthenticatedDoctorId(
                    authenticatedUserId
            );

    return getByDoctorId(
            doctorId
    );
}

public Prescription createDoctorOwnedPrescription(
        Long authenticatedUserId,
        Prescription prescription
) {

    Long doctorId =
            getAuthenticatedDoctorId(
                    authenticatedUserId
            );

    if (prescription.getDoctorId() == null
            || !doctorId.equals(
                    prescription.getDoctorId()
            )) {

        throw new RuntimeException(
                "Doctor ID không khớp với bác sĩ đang đăng nhập"
        );
    }

    MedicalRecordResponse medicalRecord =
            medicalRecordClient.getMedicalRecord(
                    prescription.getMedicalRecordId()
            );

    if (!doctorId.equals(
            medicalRecord.getDoctorId()
    )) {

        throw new RuntimeException(
                "Hồ sơ bệnh án không thuộc bác sĩ đang đăng nhập"
        );
    }

    return createPrescription(
            prescription
    );
}
}