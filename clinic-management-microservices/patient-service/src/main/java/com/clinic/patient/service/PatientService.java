package com.clinic.patient.service;

import com.clinic.patient.entity.Patient;
import com.clinic.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public Patient createPatient(Patient patient) {

        if (patientRepository.existsByUserId(patient.getUserId())) {
            throw new RuntimeException("Hồ sơ bệnh nhân đã tồn tại");
        }

        return patientRepository.save(patient);
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy bệnh nhân")
                );
    }

    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ bệnh nhân")
                );
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient updatePatient(Long id, Patient request) {

        Patient patient = getPatientById(id);

        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setAddress(request.getAddress());
        patient.setBloodType(request.getBloodType());
        patient.setAllergies(request.getAllergies());
        patient.setMedicalHistory(request.getMedicalHistory());

        return patientRepository.save(patient);
    }

    public Patient getOwnedPatientById(
        Long patientId,
        Long authenticatedUserId
    ) {

        Patient patient =
                getPatientById(patientId);

        if (!patient.getUserId()
                .equals(authenticatedUserId)) {

            throw new RuntimeException(
                    "Bạn không có quyền truy cập hồ sơ bệnh nhân này"
            );
        }

        return patient;
    }

    public Patient getOwnedPatientByUserId(
            Long requestedUserId,
            Long authenticatedUserId
    ) {

        if (!requestedUserId.equals(
                authenticatedUserId
        )) {
            throw new RuntimeException(
                    "Bạn không có quyền truy cập hồ sơ bệnh nhân này"
            );
        }

        return getPatientByUserId(
                requestedUserId
        );
    }
}