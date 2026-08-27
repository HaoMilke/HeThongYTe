package com.clinic.doctor.repository;

import com.clinic.doctor.entity.Specialty;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpecialtyRepository
        extends JpaRepository<Specialty, Long> {

    Optional<Specialty> findByNameIgnoreCase(
            String name
    );

    boolean existsByNameIgnoreCase(
            String name
    );

    List<Specialty> findByActiveTrue();
}