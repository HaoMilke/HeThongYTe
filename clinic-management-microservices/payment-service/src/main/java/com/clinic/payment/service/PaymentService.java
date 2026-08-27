package com.clinic.payment.service;

import com.clinic.payment.client.AppointmentClient;
import com.clinic.payment.dto.AppointmentResponse;
import com.clinic.payment.entity.Invoice;
import com.clinic.payment.entity.InvoiceStatus;
import com.clinic.payment.entity.Payment;
import com.clinic.payment.entity.PaymentStatus;
import com.clinic.payment.repository.InvoiceRepository;
import com.clinic.payment.repository.PaymentRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import com.clinic.payment.client.PatientClient;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final AppointmentClient appointmentClient;
    private final PatientClient patientClient;

    public PaymentService(
        PaymentRepository paymentRepository,
        InvoiceRepository invoiceRepository,
        AppointmentClient appointmentClient,
        PatientClient patientClient
) {
    this.paymentRepository =
            paymentRepository;

    this.invoiceRepository =
            invoiceRepository;

    this.appointmentClient =
            appointmentClient;

    this.patientClient =
            patientClient;
}

    public Payment createPayment(
            Payment payment
    ) {

        if (payment.getAppointmentId() == null) {
            throw new RuntimeException(
                    "Appointment ID không được để trống"
            );
        }

        if (payment.getPatientId() == null) {
            throw new RuntimeException(
                    "Patient ID không được để trống"
            );
        }

        if (payment.getInvoiceId() == null) {
            throw new RuntimeException(
                    "Invoice ID không được để trống"
            );
        }

        if (payment.getPaymentMethod() == null) {
            throw new RuntimeException(
                    "Phương thức thanh toán không được để trống"
            );
        }

        if (paymentRepository.existsByAppointmentId(
                payment.getAppointmentId()
        )) {
            throw new RuntimeException(
                    "Lịch khám này đã có thanh toán"
            );
        }

        AppointmentResponse appointment =
                appointmentClient.getAppointment(
                        payment.getAppointmentId()
                );

        if (!payment.getPatientId().equals(
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
                    "Chỉ có thể tạo thanh toán khi lịch khám đã COMPLETED"
            );
        }

        Invoice invoice =
                invoiceRepository
                        .findById(payment.getInvoiceId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy hóa đơn"
                                )
                        );

        if (!payment.getAppointmentId().equals(
                invoice.getAppointmentId()
        )) {
            throw new RuntimeException(
                    "Invoice không thuộc lịch khám này"
            );
        }

        if (!payment.getPatientId().equals(
                invoice.getPatientId()
        )) {
            throw new RuntimeException(
                    "Patient ID không khớp với hóa đơn"
            );
        }

        if (invoice.getStatus()
                != InvoiceStatus.UNPAID) {

            throw new RuntimeException(
                    "Chỉ có thể thanh toán hóa đơn UNPAID"
            );
        }

        payment.setAmount(
                invoice.getTotalAmount()
        );

        payment.setId(null);

        payment.setStatus(
                PaymentStatus.PENDING
        );

        payment.setTransactionCode(null);

        payment.setPaidAt(null);

        return paymentRepository.save(
                payment
        );
    }

    public Payment getById(
            Long id
    ) {

        return paymentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy thanh toán"
                        )
                );
    }

    public Payment getByAppointmentId(
            Long appointmentId
    ) {

        return paymentRepository
                .findByAppointmentId(
                        appointmentId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy thanh toán"
                        )
                );
    }

    public List<Payment> getByPatientId(
            Long patientId
    ) {

        return paymentRepository
                .findByPatientId(
                        patientId
                );
    }

    public List<Payment> getAll() {
        return paymentRepository.findAll();
    }

    public Payment markAsPaid(
            Long id,
            String transactionCode
    ) {

        Payment payment =
                getById(id);

        if (payment.getStatus()
                != PaymentStatus.PENDING) {

            throw new RuntimeException(
                    "Chỉ thanh toán PENDING mới có thể chuyển sang PAID"
            );
        }

        if (payment.getPaymentMethod() != null
                && payment.getPaymentMethod()
                        .name()
                        .equals("CASH")) {

            if (transactionCode != null
                    && transactionCode.isBlank()) {

                transactionCode = null;
            }

        } else {

            if (transactionCode == null
                    || transactionCode.isBlank()) {

                throw new RuntimeException(
                        "Transaction code không được để trống"
                );
            }
        }

        Invoice invoice =
                invoiceRepository
                        .findById(payment.getInvoiceId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy hóa đơn"
                                )
                        );

        if (invoice.getStatus()
                != InvoiceStatus.UNPAID) {

            throw new RuntimeException(
                    "Hóa đơn không còn ở trạng thái UNPAID"
            );
        }

        payment.setStatus(
                PaymentStatus.PAID
        );

        payment.setTransactionCode(
                transactionCode
        );

        payment.setPaidAt(
                LocalDateTime.now()
        );

        invoice.setStatus(
                InvoiceStatus.PAID
        );

        invoiceRepository.save(
                invoice
        );

        return paymentRepository.save(
                payment
        );
    }

    public Payment refund(
            Long id
    ) {

        Payment payment =
                getById(id);

        if (payment.getStatus()
                != PaymentStatus.PAID) {

            throw new RuntimeException(
                    "Chỉ thanh toán PAID mới có thể hoàn tiền"
            );
        }

        payment.setStatus(
                PaymentStatus.REFUNDED
        );

        return paymentRepository.save(
                payment
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

public Payment getOwnedPaymentById(
        Long paymentId,
        Long authenticatedUserId
) {

    Long patientId =
            getAuthenticatedPatientId(
                    authenticatedUserId
            );

    Payment payment =
            getById(paymentId);

    if (!patientId.equals(
            payment.getPatientId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền truy cập thanh toán này"
        );
    }

    return payment;
}

public Payment getOwnedPaymentByAppointmentId(
        Long appointmentId,
        Long authenticatedUserId
) {

    Payment payment =
            getByAppointmentId(
                    appointmentId
            );

    Long patientId =
            getAuthenticatedPatientId(
                    authenticatedUserId
            );

    if (!patientId.equals(
            payment.getPatientId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền truy cập thanh toán này"
        );
    }

    return payment;
}

public List<Payment> getOwnedPayments(
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