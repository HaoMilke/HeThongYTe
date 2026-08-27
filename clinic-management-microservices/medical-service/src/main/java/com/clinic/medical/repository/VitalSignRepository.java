package com.clinic.medical.repository;

import com.clinic.medical.entity.VitalSign;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VitalSignRepository
        extends JpaRepository<VitalSign, Long> {

    List<VitalSign> findByMedicalRecordIdOrderByMeasuredAtDesc(
            Long medicalRecordId
    );

    boolean existsByMedicalRecordId(
            Long medicalRecordId
    );
}