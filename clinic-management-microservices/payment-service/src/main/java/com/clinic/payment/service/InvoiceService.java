package com.clinic.payment.service;

import com.clinic.payment.client.AppointmentClient;
import com.clinic.payment.dto.AppointmentResponse;
import com.clinic.payment.entity.Invoice;
import com.clinic.payment.entity.InvoiceItem;
import com.clinic.payment.entity.InvoiceItemType;
import com.clinic.payment.entity.InvoiceStatus;
import com.clinic.payment.repository.InvoiceRepository;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

import com.clinic.payment.client.PatientClient;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final AppointmentClient appointmentClient;
    private final PatientClient patientClient;

    public InvoiceService(
        InvoiceRepository invoiceRepository,
        AppointmentClient appointmentClient,
        PatientClient patientClient
) {
    this.invoiceRepository =
            invoiceRepository;

    this.appointmentClient =
            appointmentClient;

    this.patientClient =
            patientClient;
}

    @Transactional
    public Invoice createInvoice(
            Invoice invoice
    ) {

        if (invoice.getAppointmentId() == null) {
            throw new RuntimeException(
                    "Appointment ID không được để trống"
            );
        }

        if (invoice.getPatientId() == null) {
            throw new RuntimeException(
                    "Patient ID không được để trống"
            );
        }

        var existingInvoice =
                invoiceRepository.findByAppointmentId(
                        invoice.getAppointmentId()
                );

        if (existingInvoice.isPresent()) {
            return existingInvoice.get();
        }

        AppointmentResponse appointment =
                appointmentClient.getAppointment(
                        invoice.getAppointmentId()
                );

        if (!invoice.getPatientId().equals(
                appointment.getPatientId()
        )) {
            throw new RuntimeException(
                    "Patient ID không khớp với lịch khám"
            );
        }

        if (!"COMPLETED".equals(
                appointment.getStatus()
        )) {
            throw new RuntimeException(
                    "Chỉ tạo hóa đơn khi lịch khám đã COMPLETED"
            );
        }

        if (invoice.getItems() == null
                || invoice.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Hóa đơn phải có ít nhất một chi tiết"
            );
        }

        BigDecimal examinationAmount =
                BigDecimal.ZERO;

        BigDecimal medicineAmount =
                BigDecimal.ZERO;

        BigDecimal otherAmount =
                BigDecimal.ZERO;

        for (InvoiceItem item : invoice.getItems()) {

            validateItem(item);

            BigDecimal amount =
                    item.getUnitPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            item.getQuantity()
                                    )
                            );

            item.setAmount(amount);
            item.setId(null);
            item.setInvoice(invoice);

            if (item.getItemType()
                    == InvoiceItemType.EXAMINATION) {

                examinationAmount =
                        examinationAmount.add(amount);

            } else if (item.getItemType()
                    == InvoiceItemType.MEDICINE) {

                medicineAmount =
                        medicineAmount.add(amount);

            } else if (item.getItemType()
                    == InvoiceItemType.OTHER) {

                otherAmount =
                        otherAmount.add(amount);
            }
        }

        BigDecimal totalAmount =
                examinationAmount
                        .add(medicineAmount)
                        .add(otherAmount);

        invoice.setId(null);

        invoice.setExaminationAmount(
                examinationAmount
        );

        invoice.setMedicineAmount(
                medicineAmount
        );

        invoice.setOtherAmount(
                otherAmount
        );

        invoice.setTotalAmount(
                totalAmount
        );

        invoice.setStatus(
                InvoiceStatus.UNPAID
        );

        return invoiceRepository.save(
                invoice
        );
    }

    private void validateItem(
            InvoiceItem item
    ) {

        if (item == null) {
            throw new RuntimeException(
                    "Chi tiết hóa đơn không hợp lệ"
            );
        }

        if (item.getItemType() == null) {
            throw new RuntimeException(
                    "Loại chi phí không được để trống"
            );
        }

        if (item.getDescription() == null
                || item.getDescription().isBlank()) {

            throw new RuntimeException(
                    "Mô tả chi phí không được để trống"
            );
        }

        if (item.getQuantity() == null
                || item.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Số lượng phải lớn hơn 0"
            );
        }

        if (item.getUnitPrice() == null
                || item.getUnitPrice()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Đơn giá không được âm"
            );
        }

        item.setDescription(
                item.getDescription().trim()
        );
    }

    public Invoice getById(
            Long id
    ) {

        return invoiceRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy hóa đơn"
                        )
                );
    }

    public Invoice getByAppointmentId(
            Long appointmentId
    ) {

        return invoiceRepository
                .findByAppointmentId(
                        appointmentId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy hóa đơn"
                        )
                );
    }

    public List<Invoice> getByPatientId(
            Long patientId
    ) {
        return invoiceRepository
                .findByPatientId(
                        patientId
                );
    }

    public List<Invoice> getAll() {
        return invoiceRepository.findAll();
    }

    public Invoice cancelInvoice(
            Long id
    ) {

        Invoice invoice = getById(id);

        if (invoice.getStatus()
                == InvoiceStatus.PAID) {

            throw new RuntimeException(
                    "Hóa đơn đã thanh toán không thể hủy"
            );
        }

        invoice.setStatus(
                InvoiceStatus.CANCELLED
        );

        return invoiceRepository.save(
                invoice
        );
    }

    public Invoice markAsPaid(
            Long id
    ) {

        Invoice invoice = getById(id);

        if (invoice.getStatus()
                != InvoiceStatus.UNPAID) {

            throw new RuntimeException(
                    "Chỉ hóa đơn UNPAID mới chuyển sang PAID"
            );
        }

        invoice.setStatus(
                InvoiceStatus.PAID
        );

        return invoiceRepository.save(
                invoice
        );
    }

    public Long getAuthenticatedPatientId(
        Long authenticatedUserId
) {

    if (authenticatedUserId == null) {
        throw new RuntimeException(
                "Không xác định được người dùng hiện tại"
        );
    }

    return patientClient
            .getPatientIdByUserId(
                    authenticatedUserId
            );
}

public Invoice getOwnedInvoiceById(
        Long invoiceId,
        Long authenticatedUserId
) {

    Long patientId =
            getAuthenticatedPatientId(
                    authenticatedUserId
            );

    Invoice invoice =
            getById(invoiceId);

    if (!patientId.equals(
            invoice.getPatientId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền truy cập hóa đơn này"
        );
    }

    return invoice;
}

public Invoice getOwnedInvoiceByAppointmentId(
        Long appointmentId,
        Long authenticatedUserId
) {

    Invoice invoice =
            getByAppointmentId(
                    appointmentId
            );

    Long patientId =
            getAuthenticatedPatientId(
                    authenticatedUserId
            );

    if (!patientId.equals(
            invoice.getPatientId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền truy cập hóa đơn này"
        );
    }

    return invoice;
}

public List<Invoice> getOwnedInvoices(
        Long authenticatedUserId
) {

    Long patientId =
            getAuthenticatedPatientId(
                    authenticatedUserId
            );

    return getByPatientId(
            patientId
    );
}
}