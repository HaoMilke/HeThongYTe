package com.clinic.doctor.repository;

import com.clinic.doctor.entity.DoctorTimeOff;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorTimeOffRepository
        extends JpaRepository<DoctorTimeOff, Long> {

    List<DoctorTimeOff> findByDoctorId(Long doctorId);

    List<DoctorTimeOff> findByDoctorIdAndActiveTrue(
            Long doctorId
    );
}