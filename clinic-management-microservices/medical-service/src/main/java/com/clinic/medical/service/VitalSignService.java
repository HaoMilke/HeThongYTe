package com.clinic.medical.service;

import com.clinic.medical.client.PatientClient;
import com.clinic.medical.entity.VitalSign;
import com.clinic.medical.repository.MedicalRecordRepository;
import com.clinic.medical.repository.VitalSignRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

import com.clinic.medical.entity.MedicalRecord;
import com.clinic.medical.client.DoctorClient;



@Service
public class VitalSignService {

    private final VitalSignRepository vitalSignRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientClient patientClient;
    private final DoctorClient doctorClient;

    public VitalSignService(
        VitalSignRepository vitalSignRepository,
        MedicalRecordRepository medicalRecordRepository,
        PatientClient patientClient,
        DoctorClient doctorClient
) {
    this.vitalSignRepository =
            vitalSignRepository;

    this.medicalRecordRepository =
            medicalRecordRepository;

    this.patientClient =
            patientClient;

    this.doctorClient =
            doctorClient;
}

    public VitalSign createVitalSign(
            VitalSign vitalSign
    ) {

        if (vitalSign == null) {
            throw new RuntimeException(
                    "Thông tin sinh hiệu không hợp lệ"
            );
        }

        if (vitalSign.getMedicalRecordId() == null) {
            throw new RuntimeException(
                    "Medical Record ID không được để trống"
            );
        }

        if (!medicalRecordRepository.existsById(
                vitalSign.getMedicalRecordId()
        )) {
            throw new RuntimeException(
                    "Không tìm thấy hồ sơ bệnh án"
            );
        }

        validateVitalSign(vitalSign);

        vitalSign.setId(null);

        return vitalSignRepository.save(
                vitalSign
        );
    }

    public VitalSign getById(
            Long id
    ) {

        return vitalSignRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy thông tin sinh hiệu"
                        )
                );
    }

    public List<VitalSign> getByMedicalRecordId(
            Long medicalRecordId
    ) {

        if (!medicalRecordRepository.existsById(
                medicalRecordId
        )) {
            throw new RuntimeException(
                    "Không tìm thấy hồ sơ bệnh án"
            );
        }

        return vitalSignRepository
                .findByMedicalRecordIdOrderByMeasuredAtDesc(
                        medicalRecordId
                );
    }

    public VitalSign updateVitalSign(
            Long id,
            VitalSign request
    ) {

        VitalSign vitalSign =
                getById(id);

        if (request.getSystolicPressure() != null) {
            vitalSign.setSystolicPressure(
                    request.getSystolicPressure()
            );
        }

        if (request.getDiastolicPressure() != null) {
            vitalSign.setDiastolicPressure(
                    request.getDiastolicPressure()
            );
        }

        if (request.getHeartRate() != null) {
            vitalSign.setHeartRate(
                    request.getHeartRate()
            );
        }

        if (request.getTemperature() != null) {
            vitalSign.setTemperature(
                    request.getTemperature()
            );
        }

        if (request.getWeight() != null) {
            vitalSign.setWeight(
                    request.getWeight()
            );
        }

        if (request.getHeight() != null) {
            vitalSign.setHeight(
                    request.getHeight()
            );
        }

        if (request.getMeasuredAt() != null) {
            vitalSign.setMeasuredAt(
                    request.getMeasuredAt()
            );
        }

        if (request.getNotes() != null) {
            vitalSign.setNotes(
                    request.getNotes()
            );
        }

        validateVitalSign(vitalSign);

        return vitalSignRepository.save(
                vitalSign
        );
    }

    private void validateVitalSign(
            VitalSign vitalSign
    ) {

        if (vitalSign.getSystolicPressure() != null
                && (vitalSign.getSystolicPressure() < 50
                || vitalSign.getSystolicPressure() > 250)) {

            throw new RuntimeException(
                    "Huyết áp tâm thu không hợp lệ"
            );
        }

        if (vitalSign.getDiastolicPressure() != null
                && (vitalSign.getDiastolicPressure() < 30
                || vitalSign.getDiastolicPressure() > 150)) {

            throw new RuntimeException(
                    "Huyết áp tâm trương không hợp lệ"
            );
        }

        if (vitalSign.getSystolicPressure() != null
                && vitalSign.getDiastolicPressure() != null
                && vitalSign.getSystolicPressure()
                <= vitalSign.getDiastolicPressure()) {

            throw new RuntimeException(
                    "Huyết áp tâm thu phải lớn hơn huyết áp tâm trương"
            );
        }

        if (vitalSign.getHeartRate() != null
                && (vitalSign.getHeartRate() < 20
                || vitalSign.getHeartRate() > 250)) {

            throw new RuntimeException(
                    "Nhịp tim không hợp lệ"
            );
        }

        if (vitalSign.getTemperature() != null
                && (vitalSign.getTemperature()
                .compareTo(new BigDecimal("30")) < 0
                || vitalSign.getTemperature()
                .compareTo(new BigDecimal("45")) > 0)) {

            throw new RuntimeException(
                    "Nhiệt độ không hợp lệ"
            );
        }

        if (vitalSign.getWeight() != null
                && (vitalSign.getWeight()
                .compareTo(BigDecimal.ZERO) <= 0
                || vitalSign.getWeight()
                .compareTo(new BigDecimal("500")) > 0)) {

            throw new RuntimeException(
                    "Cân nặng không hợp lệ"
            );
        }

        if (vitalSign.getHeight() != null
                && (vitalSign.getHeight()
                .compareTo(new BigDecimal("30")) < 0
                || vitalSign.getHeight()
                .compareTo(new BigDecimal("250")) > 0)) {

            throw new RuntimeException(
                    "Chiều cao không hợp lệ"
            );
        }
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

public VitalSign getOwnedVitalSignById(
        Long vitalSignId,
        Long authenticatedUserId
) {

    VitalSign vitalSign =
            getById(vitalSignId);

    validateMedicalRecordOwnership(
            vitalSign.getMedicalRecordId(),
            authenticatedUserId
    );

    return vitalSign;
}

public List<VitalSign> getOwnedVitalSignsByMedicalRecordId(
        Long medicalRecordId,
        Long authenticatedUserId
) {

    validateMedicalRecordOwnership(
            medicalRecordId,
            authenticatedUserId
    );

    return getByMedicalRecordId(
            medicalRecordId
    );
}

private void validateMedicalRecordOwnership(
        Long medicalRecordId,
        Long authenticatedUserId
) {

    Long authenticatedPatientId =
            getAuthenticatedPatientId(
                    authenticatedUserId
            );

    MedicalRecord medicalRecord =
            medicalRecordRepository
                    .findById(medicalRecordId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Không tìm thấy hồ sơ bệnh án"
                            )
                    );

    if (!authenticatedPatientId.equals(
            medicalRecord.getPatientId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền truy cập thông tin sinh hiệu này"
        );
    }
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

private void validateDoctorMedicalRecordOwnership(
        Long medicalRecordId,
        Long authenticatedUserId
) {

    Long doctorId =
            getAuthenticatedDoctorId(
                    authenticatedUserId
            );

    MedicalRecord record =
            medicalRecordRepository
                    .findById(medicalRecordId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Không tìm thấy hồ sơ bệnh án"
                            )
                    );

    if (!doctorId.equals(
            record.getDoctorId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền thao tác sinh hiệu của bác sĩ khác"
        );
    }
}

public VitalSign getDoctorOwnedVitalSignById(
        Long vitalSignId,
        Long authenticatedUserId
) {

    VitalSign vitalSign =
            getById(vitalSignId);

    validateDoctorMedicalRecordOwnership(
            vitalSign.getMedicalRecordId(),
            authenticatedUserId
    );

    return vitalSign;
}

public List<VitalSign> getDoctorOwnedVitalSignsByMedicalRecordId(
        Long medicalRecordId,
        Long authenticatedUserId
) {

    validateDoctorMedicalRecordOwnership(
            medicalRecordId,
            authenticatedUserId
    );

    return getByMedicalRecordId(
            medicalRecordId
    );
}

public VitalSign createDoctorOwnedVitalSign(
        Long authenticatedUserId,
        VitalSign vitalSign
) {

    validateDoctorMedicalRecordOwnership(
            vitalSign.getMedicalRecordId(),
            authenticatedUserId
    );

    return createVitalSign(
            vitalSign
    );
}

public VitalSign updateDoctorOwnedVitalSign(
        Long vitalSignId,
        Long authenticatedUserId,
        VitalSign request
) {

    VitalSign vitalSign =
            getDoctorOwnedVitalSignById(
                    vitalSignId,
                    authenticatedUserId
            );

    return updateVitalSign(
            vitalSign.getId(),
            request
    );
}
}