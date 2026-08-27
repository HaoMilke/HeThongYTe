package com.clinic.prescription.repository;

import com.clinic.prescription.entity.Medicine;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicineRepository
        extends JpaRepository<Medicine, Long> {

    Optional<Medicine> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Medicine> findByActiveTrue();

    List<Medicine> findByNameContainingIgnoreCase(String keyword);
}