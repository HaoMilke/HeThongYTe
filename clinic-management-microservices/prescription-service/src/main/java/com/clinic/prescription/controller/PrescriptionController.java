package com.clinic.prescription.controller;

import com.clinic.prescription.entity.Prescription;
import com.clinic.prescription.service.PrescriptionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(
            PrescriptionService prescriptionService
    ) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Prescription prescription,
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

            if (isDoctorOnly(roles)) {
                return ResponseEntity
                        .status(HttpStatus.CREATED)
                        .body(
                                prescriptionService
                                        .createDoctorOwnedPrescription(
                                                authenticatedUserId,
                                                prescription
                                        )
                        );
            }

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            prescriptionService
                                    .createPrescription(
                                            prescription
                                    )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
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
                        prescriptionService
                                .getOwnedPrescriptionById(
                                        id,
                                        authenticatedUserId
                                )
                );
            }

            if (isDoctorOnly(roles)) {
                return ResponseEntity.ok(
                        prescriptionService
                                .getDoctorOwnedPrescriptionById(
                                        id,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    prescriptionService.getById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/medical-record/{medicalRecordId}")
    public ResponseEntity<?> getByMedicalRecord(
            @PathVariable Long medicalRecordId,
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
                        prescriptionService
                                .getOwnedPrescriptionByMedicalRecordId(
                                        medicalRecordId,
                                        authenticatedUserId
                                )
                );
            }

            if (isDoctorOnly(roles)) {
                return ResponseEntity.ok(
                        prescriptionService
                                .getDoctorOwnedPrescriptionByMedicalRecordId(
                                        medicalRecordId,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    prescriptionService
                            .getByMedicalRecordId(
                                    medicalRecordId
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

            if (isDoctorOnly(roles)) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "Bác sĩ không có quyền xem toàn bộ đơn thuốc theo patientId"
                        );
            }

            if (isPatientOnly(roles)) {

                Long ownedPatientId =
                        prescriptionService
                                .getAuthenticatedPatientId(
                                        authenticatedUserId
                                );

                if (!ownedPatientId.equals(patientId)) {
                    throw new RuntimeException(
                            "Bạn không có quyền truy cập đơn thuốc của bệnh nhân này"
                    );
                }
            }

            return ResponseEntity.ok(
                    prescriptionService
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

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getByDoctor(
            @PathVariable Long doctorId,
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
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "Bệnh nhân không có quyền xem danh sách đơn thuốc theo bác sĩ"
                        );
            }

            if (isDoctorOnly(roles)) {

                Long ownedDoctorId =
                        prescriptionService
                                .getAuthenticatedDoctorId(
                                        authenticatedUserId
                                );

                if (!ownedDoctorId.equals(doctorId)) {
                    throw new RuntimeException(
                            "Bạn không có quyền xem đơn thuốc của bác sĩ khác"
                    );
                }
            }

            return ResponseEntity.ok(
                    prescriptionService
                            .getByDoctorId(
                                    doctorId
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
                        prescriptionService
                                .getOwnedPrescriptions(
                                        authenticatedUserId
                                )
                );
            }

            if (isDoctorOnly(roles)) {
                return ResponseEntity.ok(
                        prescriptionService
                                .getDoctorOwnedPrescriptions(
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    prescriptionService.getAll()
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    private boolean isPatientOnly(
            String roles
    ) {

        if (roles == null || roles.isBlank()) {
            return false;
        }

        boolean patient =
                roles.contains("ROLE_PATIENT");

        boolean privileged =
                roles.contains("ROLE_ADMIN")
                        || roles.contains("ROLE_DOCTOR")
                        || roles.contains("ROLE_RECEPTIONIST");

        return patient && !privileged;
    }

    private boolean isDoctorOnly(
            String roles
    ) {

        if (roles == null || roles.isBlank()) {
            return false;
        }

        boolean doctor =
                roles.contains("ROLE_DOCTOR");

        boolean elevated =
                roles.contains("ROLE_ADMIN")
                        || roles.contains("ROLE_RECEPTIONIST");

        return doctor && !elevated;
    }
}