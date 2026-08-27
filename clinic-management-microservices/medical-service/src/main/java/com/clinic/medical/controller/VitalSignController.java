package com.clinic.medical.controller;

import com.clinic.medical.entity.VitalSign;
import com.clinic.medical.service.VitalSignService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vital-signs")
public class VitalSignController {

    private final VitalSignService vitalSignService;

    public VitalSignController(
            VitalSignService vitalSignService
    ) {
        this.vitalSignService = vitalSignService;
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody VitalSign vitalSign,
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
                                vitalSignService
                                        .createDoctorOwnedVitalSign(
                                                authenticatedUserId,
                                                vitalSign
                                        )
                        );
            }

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            vitalSignService
                                    .createVitalSign(vitalSign)
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
                        vitalSignService
                                .getOwnedVitalSignById(
                                        id,
                                        authenticatedUserId
                                )
                );
            }

            if (isDoctorOnly(roles)) {
                return ResponseEntity.ok(
                        vitalSignService
                                .getDoctorOwnedVitalSignById(
                                        id,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    vitalSignService.getById(id)
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
                        vitalSignService
                                .getOwnedVitalSignsByMedicalRecordId(
                                        medicalRecordId,
                                        authenticatedUserId
                                )
                );
            }

            if (isDoctorOnly(roles)) {
                return ResponseEntity.ok(
                        vitalSignService
                                .getDoctorOwnedVitalSignsByMedicalRecordId(
                                        medicalRecordId,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    vitalSignService
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

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody VitalSign request,
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
                                "Bệnh nhân không có quyền sửa sinh hiệu"
                        );
            }

            if (isDoctorOnly(roles)) {
                return ResponseEntity.ok(
                        vitalSignService
                                .updateDoctorOwnedVitalSign(
                                        id,
                                        authenticatedUserId,
                                        request
                                )
                );
            }

            return ResponseEntity.ok(
                    vitalSignService
                            .updateVitalSign(
                                    id,
                                    request
                            )
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