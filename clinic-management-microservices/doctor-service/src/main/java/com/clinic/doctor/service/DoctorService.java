package com.clinic.doctor.service;

import com.clinic.doctor.entity.Doctor;
import com.clinic.doctor.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public Doctor createDoctor(Doctor doctor) {
        if (doctorRepository.existsByUserId(doctor.getUserId())) {
            throw new RuntimeException("Hồ sơ bác sĩ đã tồn tại");
        }

        return doctorRepository.save(doctor);
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy bác sĩ")
                );
    }

    public Doctor getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy hồ sơ bác sĩ")
                );
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization);
    }

    public List<Doctor> getAvailableDoctors() {
        return doctorRepository.findByAvailableTrue();
    }

    public Doctor updateDoctor(Long id, Doctor request) {
        Doctor doctor = getDoctorById(id);

        doctor.setFullName(request.getFullName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setSpecialtyId(request.getSpecialtyId());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setPhone(request.getPhone());
        doctor.setEmail(request.getEmail());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setQualification(request.getQualification());
        doctor.setBio(request.getBio());
        doctor.setAvailable(request.getAvailable());

        return doctorRepository.save(doctor);
    }

    public Long getAuthenticatedDoctorId(
        Long authenticatedUserId
) {
    if (authenticatedUserId == null) {
        throw new RuntimeException(
                "Không xác định được người dùng hiện tại"
        );
    }

    return getDoctorByUserId(
            authenticatedUserId
    ).getId();
}

public void validateDoctorOwnership(
        Long doctorId,
        Long authenticatedUserId
) {
    Long ownedDoctorId =
            getAuthenticatedDoctorId(
                    authenticatedUserId
            );

    if (!ownedDoctorId.equals(doctorId)) {
        throw new RuntimeException(
                "Bạn không có quyền thao tác dữ liệu của bác sĩ khác"
        );
    }
}

public Doctor updateOwnedDoctor(
        Long id,
        Long authenticatedUserId,
        Doctor request
) {
    validateDoctorOwnership(
            id,
            authenticatedUserId
    );

    return updateDoctor(
            id,
            request
    );
}
}