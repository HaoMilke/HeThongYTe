package com.clinic.payment.repository;

import com.clinic.payment.entity.Payment;
import com.clinic.payment.entity.PaymentStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByAppointmentId(Long appointmentId);

    List<Payment> findByPatientId(Long patientId);

    List<Payment> findByStatus(PaymentStatus status);

    boolean existsByAppointmentId(Long appointmentId);
}