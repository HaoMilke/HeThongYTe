package com.clinic.medical.service;

import com.clinic.medical.client.AppointmentClient;
import com.clinic.medical.dto.AppointmentResponse;
import com.clinic.medical.entity.MedicalRecord;
import com.clinic.medical.repository.MedicalRecordRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import com.clinic.medical.client.PatientClient;

import com.clinic.medical.client.DoctorClient;


@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentClient appointmentClient;
    private final PatientClient patientClient;
    private final DoctorClient doctorClient;

   public MedicalRecordService(
        MedicalRecordRepository medicalRecordRepository,
        AppointmentClient appointmentClient,
        PatientClient patientClient,
        DoctorClient doctorClient
) {
    this.medicalRecordRepository =
            medicalRecordRepository;

    this.appointmentClient =
            appointmentClient;

    this.patientClient =
            patientClient;

    this.doctorClient =
            doctorClient;
}

    public MedicalRecord createMedicalRecord(
            MedicalRecord record
    ) {

        if (record.getAppointmentId() == null) {
            throw new RuntimeException(
                    "Appointment ID không được để trống"
            );
        }

        if (record.getPatientId() == null) {
            throw new RuntimeException(
                    "Patient ID không được để trống"
            );
        }

        if (record.getDoctorId() == null) {
            throw new RuntimeException(
                    "Doctor ID không được để trống"
            );
        }

        if (medicalRecordRepository
                .existsByAppointmentId(
                        record.getAppointmentId()
                )) {

            throw new RuntimeException(
                    "Lịch khám này đã có hồ sơ bệnh án"
            );
        }

        AppointmentResponse appointment =
                appointmentClient.getAppointment(
                        record.getAppointmentId()
                );

        if (!record.getPatientId().equals(
                appointment.getPatientId()
        )) {
            throw new RuntimeException(
                    "Patient ID không khớp với lịch khám"
            );
        }

        if (!record.getDoctorId().equals(
                appointment.getDoctorId()
        )) {
            throw new RuntimeException(
                    "Doctor ID không khớp với lịch khám"
            );
        }

        if (!"COMPLETED".equals(
                appointment.getStatus()
        )) {
            throw new RuntimeException(
                    "Chỉ có thể tạo hồ sơ bệnh án khi lịch khám đã COMPLETED"
            );
        }

        record.setId(null);

        if (record.getExaminationDate() == null) {
            record.setExaminationDate(
                    LocalDateTime.now()
            );
        }

        return medicalRecordRepository.save(
                record
        );
    }

    public MedicalRecord getById(Long id) {

        return medicalRecordRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy hồ sơ bệnh án"
                        )
                );
    }

    public MedicalRecord getByAppointmentId(
            Long appointmentId
    ) {

        return medicalRecordRepository
                .findByAppointmentId(
                        appointmentId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy hồ sơ bệnh án"
                        )
                );
    }

    public List<MedicalRecord> getByPatientId(
            Long patientId
    ) {
        return medicalRecordRepository
                .findByPatientId(patientId);
    }

    public List<MedicalRecord> getByDoctorId(
            Long doctorId
    ) {
        return medicalRecordRepository
                .findByDoctorId(doctorId);
    }

    public List<MedicalRecord> getAll() {
        return medicalRecordRepository.findAll();
    }

    public MedicalRecord updateMedicalRecord(
            Long id,
            MedicalRecord request
    ) {

        MedicalRecord record =
                getById(id);

        if (request.getSymptoms() != null) {
            record.setSymptoms(
                    request.getSymptoms()
            );
        }

        if (request.getDiagnosis() != null) {
            record.setDiagnosis(
                    request.getDiagnosis()
            );
        }

        if (request.getTreatment() != null) {
            record.setTreatment(
                    request.getTreatment()
            );
        }

        if (request.getNotes() != null) {
            record.setNotes(
                    request.getNotes()
            );
        }

        return medicalRecordRepository.save(
                record
        );
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

public MedicalRecord getOwnedRecordById(
        Long recordId,
        Long authenticatedUserId
) {

    Long patientId =
            getAuthenticatedPatientId(
                    authenticatedUserId
            );

    MedicalRecord record =
            getById(recordId);

    if (!patientId.equals(
            record.getPatientId()
    )) {
        throw new RuntimeException(
                "Bạn không có quyền truy cập hồ sơ bệnh án này"
        );
    }

    return record;
}

public MedicalRecord getOwnedRecordByAppointmentId(
        Long appointmentId,
        Long authenticatedUserId
) {

    MedicalRecord record =
            getByAppointmentId(
                    appointmentId
            );

    Long patientId =
            getAuthenticatedPatientId(
                    authenticatedUserId
            );

    if (!patientId.equals(
            record.getPatientId()
    )) {
        throw new RuntimeException(
                "Bạn không có quyền truy cập hồ sơ bệnh án này"
        );
    }

    return record;
}

public List<MedicalRecord> getOwnedRecords(
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

public MedicalRecord getDoctorOwnedRecordById(
        Long recordId,
        Long authenticatedUserId
) {

    Long doctorId =
            getAuthenticatedDoctorId(
                    authenticatedUserId
            );

    MedicalRecord record =
            getById(recordId);

    if (!doctorId.equals(
            record.getDoctorId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền truy cập hồ sơ bệnh án của bác sĩ khác"
        );
    }

    return record;
}

public MedicalRecord getDoctorOwnedRecordByAppointmentId(
        Long appointmentId,
        Long authenticatedUserId
) {

    MedicalRecord record =
            getByAppointmentId(
                    appointmentId
            );

    Long doctorId =
            getAuthenticatedDoctorId(
                    authenticatedUserId
            );

    if (!doctorId.equals(
            record.getDoctorId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền truy cập hồ sơ bệnh án của bác sĩ khác"
        );
    }

    return record;
}

public List<MedicalRecord> getDoctorOwnedRecords(
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

public MedicalRecord updateDoctorOwnedMedicalRecord(
        Long recordId,
        Long authenticatedUserId,
        MedicalRecord request
) {

    getDoctorOwnedRecordById(
            recordId,
            authenticatedUserId
    );

    return updateMedicalRecord(
            recordId,
            request
    );
}

public MedicalRecord createDoctorOwnedMedicalRecord(
        Long authenticatedUserId,
        MedicalRecord record
) {

    Long doctorId =
            getAuthenticatedDoctorId(
                    authenticatedUserId
            );

    if (record.getDoctorId() == null
            || !doctorId.equals(
                    record.getDoctorId()
            )) {

        throw new RuntimeException(
                "Doctor ID không khớp với bác sĩ đang đăng nhập"
        );
    }

    return createMedicalRecord(
            record
    );
}
}