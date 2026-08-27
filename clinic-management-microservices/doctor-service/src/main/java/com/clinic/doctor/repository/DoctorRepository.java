package com.clinic.doctor.repository;

import com.clinic.doctor.entity.Doctor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository
        extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<Doctor> findBySpecialization(
            String specialization
    );

    List<Doctor> findBySpecialtyId(
            Long specialtyId
    );

    List<Doctor> findByAvailableTrue();
}