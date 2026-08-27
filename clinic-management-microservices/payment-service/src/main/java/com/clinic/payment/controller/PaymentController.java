package com.clinic.payment.controller;

import com.clinic.payment.entity.Payment;
import com.clinic.payment.service.PaymentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService
    ) {
        this.paymentService =
                paymentService;
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Payment payment,
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) Long authenticatedUserId,
            @RequestHeader(
                    value = "X-User-Roles",
                    required = false
            ) String roles
    ) {

        try {

            if (isPatientOnly(roles)) {

                Long authenticatedPatientId =
                        paymentService
                                .getAuthenticatedPatientId(
                                        authenticatedUserId
                                );

                if (payment.getPatientId() == null
                        || !authenticatedPatientId.equals(
                                payment.getPatientId()
                        )) {

                    return ResponseEntity
                            .status(HttpStatus.FORBIDDEN)
                            .body(
                                    "Bạn không có quyền tạo thanh toán cho bệnh nhân khác"
                            );
                }
            }

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            paymentService.createPayment(
                                    payment
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable Long id,
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) Long authenticatedUserId,
            @RequestHeader(
                    value = "X-User-Roles",
                    required = false
            ) String roles
    ) {

        try {

            if (isPatientOnly(roles)) {

                return ResponseEntity.ok(
                        paymentService
                                .getOwnedPaymentById(
                                        id,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    paymentService.getById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getByAppointment(
            @PathVariable Long appointmentId,
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) Long authenticatedUserId,
            @RequestHeader(
                    value = "X-User-Roles",
                    required = false
            ) String roles
    ) {

        try {

            if (isPatientOnly(roles)) {

                return ResponseEntity.ok(
                        paymentService
                                .getOwnedPaymentByAppointmentId(
                                        appointmentId,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    paymentService
                            .getByAppointmentId(
                                    appointmentId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getByPatient(
            @PathVariable Long patientId,
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) Long authenticatedUserId,
            @RequestHeader(
                    value = "X-User-Roles",
                    required = false
            ) String roles
    ) {

        try {

            if (isPatientOnly(roles)) {

                Long ownedPatientId =
                        paymentService
                                .getAuthenticatedPatientId(
                                        authenticatedUserId
                                );

                if (!ownedPatientId.equals(
                        patientId
                )) {

                    throw new RuntimeException(
                            "Bạn không có quyền truy cập thanh toán của bệnh nhân này"
                    );
                }
            }

            return ResponseEntity.ok(
                    paymentService
                            .getByPatientId(
                                    patientId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) Long authenticatedUserId,
            @RequestHeader(
                    value = "X-User-Roles",
                    required = false
            ) String roles
    ) {

        try {

            if (isPatientOnly(roles)) {

                return ResponseEntity.ok(
                        paymentService
                                .getOwnedPayments(
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    paymentService.getAll()
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<?> pay(
            @PathVariable Long id,
            @RequestParam(
                    required = false
            ) String transactionCode,
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) Long authenticatedUserId,
            @RequestHeader(
                    value = "X-User-Roles",
                    required = false
            ) String roles
    ) {

        try {

            if (isPatientOnly(roles)) {

                paymentService
                        .getOwnedPaymentById(
                                id,
                                authenticatedUserId
                        );
            }

            return ResponseEntity.ok(
                    paymentService.markAsPaid(
                            id,
                            transactionCode
                    )
            );

        } catch (RuntimeException e) {

            if (isPatientOnly(roles)
                    && e.getMessage() != null
                    && e.getMessage().contains(
                            "không có quyền"
                    )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(e.getMessage());
            }

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/refund")
    public ResponseEntity<?> refund(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    paymentService.refund(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    private boolean isPatientOnly(
            String roles
    ) {

        if (roles == null
                || roles.isBlank()) {

            return false;
        }

        boolean patient =
                roles.contains(
                        "ROLE_PATIENT"
                );

        boolean privileged =
                roles.contains(
                        "ROLE_ADMIN"
                )
                        || roles.contains(
                                "ROLE_DOCTOR"
                        )
                        || roles.contains(
                                "ROLE_RECEPTIONIST"
                        );

        return patient
                && !privileged;
    }
}