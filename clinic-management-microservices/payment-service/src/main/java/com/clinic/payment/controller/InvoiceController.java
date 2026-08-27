package com.clinic.payment.controller;

import com.clinic.payment.entity.Invoice;
import com.clinic.payment.service.InvoiceService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(
            InvoiceService invoiceService
    ) {
        this.invoiceService =
                invoiceService;
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Invoice invoice
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        invoiceService
                                .createInvoice(invoice)
                );
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
                        invoiceService
                                .getOwnedInvoiceById(
                                        id,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    invoiceService.getById(id)
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
                        invoiceService
                                .getOwnedInvoiceByAppointmentId(
                                        appointmentId,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    invoiceService
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
                        invoiceService
                                .getAuthenticatedPatientId(
                                        authenticatedUserId
                                );

                if (!ownedPatientId.equals(
                        patientId
                )) {

                    throw new RuntimeException(
                            "Bạn không có quyền truy cập hóa đơn của bệnh nhân này"
                    );
                }
            }

            return ResponseEntity.ok(
                    invoiceService
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
                        invoiceService
                                .getOwnedInvoices(
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    invoiceService.getAll()
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<?> markAsPaid(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                invoiceService.markAsPaid(id)
        );
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                invoiceService.cancelInvoice(id)
        );
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