package com.clinic.payment.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_id", nullable = false, unique = true)
    private Long appointmentId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "examination_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal examinationAmount;

    @Column(name = "medicine_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal medicineAmount;

    @Column(name = "other_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal otherAmount;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @OneToMany(
        mappedBy = "invoice",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<InvoiceItem> items = new ArrayList<>();

    public Invoice() {
    }

    @PrePersist
    public void prePersist() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (status == null) {
            status = InvoiceStatus.UNPAID;
        }

        if (examinationAmount == null) {
            examinationAmount = BigDecimal.ZERO;
        }

        if (medicineAmount == null) {
            medicineAmount = BigDecimal.ZERO;
        }

        if (otherAmount == null) {
            otherAmount = BigDecimal.ZERO;
        }

        if (totalAmount == null) {
            totalAmount = BigDecimal.ZERO;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public BigDecimal getExaminationAmount() {
        return examinationAmount;
    }

    public void setExaminationAmount(BigDecimal examinationAmount) {
        this.examinationAmount = examinationAmount;
    }

    public BigDecimal getMedicineAmount() {
        return medicineAmount;
    }

    public void setMedicineAmount(BigDecimal medicineAmount) {
        this.medicineAmount = medicineAmount;
    }

    public BigDecimal getOtherAmount() {
        return otherAmount;
    }

    public void setOtherAmount(BigDecimal otherAmount) {
        this.otherAmount = otherAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<InvoiceItem> getItems() {
         return items;
    }

    public void setItems(List<InvoiceItem> items) {
        this.items.clear();

        if (items != null) {
            for (InvoiceItem item : items) {
                addItem(item);
            }
        }
    }

    public void addItem(InvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
    }
}