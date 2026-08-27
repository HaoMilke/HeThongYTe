package com.clinic.payment.repository;

import com.clinic.payment.entity.Invoice;
import com.clinic.payment.entity.InvoiceStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository
        extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByAppointmentId(Long appointmentId);

    List<Invoice> findByPatientId(Long patientId);

    List<Invoice> findByStatus(InvoiceStatus status);

    boolean existsByAppointmentId(Long appointmentId);
}