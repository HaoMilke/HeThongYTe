package com.clinic.doctor.service;

import com.clinic.doctor.entity.Doctor;
import com.clinic.doctor.entity.Specialty;
import com.clinic.doctor.repository.DoctorRepository;
import com.clinic.doctor.repository.SpecialtyRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpecialtyService {

    private final SpecialtyRepository specialtyRepository;
    private final DoctorRepository doctorRepository;

    public SpecialtyService(
            SpecialtyRepository specialtyRepository,
            DoctorRepository doctorRepository
    ) {
        this.specialtyRepository =
                specialtyRepository;

        this.doctorRepository =
                doctorRepository;
    }

    public Specialty createSpecialty(
            Specialty specialty
    ) {
        if (specialty.getName() == null
                || specialty.getName().isBlank()) {

            throw new RuntimeException(
                    "Tên chuyên khoa không được để trống"
            );
        }

        String normalizedName =
                specialty.getName().trim();

        if (specialtyRepository
                .existsByNameIgnoreCase(
                        normalizedName
                )) {

            throw new RuntimeException(
                    "Chuyên khoa đã tồn tại"
            );
        }

        specialty.setId(null);
        specialty.setName(normalizedName);

        if (specialty.getActive() == null) {
            specialty.setActive(true);
        }

        return specialtyRepository.save(
                specialty
        );
    }

    public Specialty getById(Long id) {
        return specialtyRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy chuyên khoa"
                        )
                );
    }

    public List<Specialty> getAll() {
        return specialtyRepository.findAll();
    }

    public List<Specialty> getActive() {
        return specialtyRepository
                .findByActiveTrue();
    }

    public Specialty updateSpecialty(
            Long id,
            Specialty request
    ) {
        Specialty specialty =
                getById(id);

        if (request.getName() == null
                || request.getName().isBlank()) {

            throw new RuntimeException(
                    "Tên chuyên khoa không được để trống"
            );
        }

        String normalizedName =
                request.getName().trim();

        specialtyRepository
                .findByNameIgnoreCase(
                        normalizedName
                )
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new RuntimeException(
                                "Tên chuyên khoa đã tồn tại"
                        );
                    }
                });

        specialty.setName(
                normalizedName
        );

        specialty.setDescription(
                request.getDescription()
        );

        if (request.getActive() != null) {
            specialty.setActive(
                    request.getActive()
            );
        }

        Specialty saved =
                specialtyRepository.save(
                        specialty
                );

        /*
         * Đồng bộ tên specialization cũ
         * cho các bác sĩ đang thuộc specialty này.
         */
        List<Doctor> doctors =
                doctorRepository
                        .findBySpecialtyId(id);

        for (Doctor doctor : doctors) {
            doctor.setSpecialization(
                    saved.getName()
            );
        }

        doctorRepository.saveAll(doctors);

        return saved;
    }

    public Specialty setActive(
            Long id,
            boolean active
    ) {
        Specialty specialty =
                getById(id);

        specialty.setActive(active);

        return specialtyRepository.save(
                specialty
        );
    }

    public Doctor assignDoctor(
            Long specialtyId,
            Long doctorId
    ) {
        Specialty specialty =
                getById(specialtyId);

        if (!Boolean.TRUE.equals(
                specialty.getActive()
        )) {
            throw new RuntimeException(
                    "Chuyên khoa đang ngừng hoạt động"
            );
        }

        Doctor doctor =
                doctorRepository.findById(
                        doctorId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy bác sĩ"
                        )
                );

        doctor.setSpecialtyId(
                specialtyId
        );

        doctor.setSpecialization(
                specialty.getName()
        );

        return doctorRepository.save(
                doctor
        );
    }

    public List<Doctor> getDoctorsBySpecialty(
            Long specialtyId
    ) {
        getById(specialtyId);

        return doctorRepository
                .findBySpecialtyId(
                        specialtyId
                );
    }

    public void deleteSpecialty(
            Long id
    ) {
        Specialty specialty =
                getById(id);

        List<Doctor> doctors =
                doctorRepository
                        .findBySpecialtyId(id);

        if (!doctors.isEmpty()) {
            throw new RuntimeException(
                    "Không thể xóa chuyên khoa đang có bác sĩ"
            );
        }

        specialtyRepository.delete(
                specialty
        );
    }
}