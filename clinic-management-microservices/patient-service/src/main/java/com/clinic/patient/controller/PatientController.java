package com.clinic.patient.controller;

import com.clinic.patient.entity.Patient;
import com.clinic.patient.service.PatientService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(
            PatientService patientService
    ) {
        this.patientService = patientService;
    }

    @PostMapping
    public ResponseEntity<?> createPatient(
            @RequestBody Patient patient
    ) {
        try {

            Patient created =
                    patientService.createPatient(
                            patient
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(created);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PostMapping("/me")
    public ResponseEntity<?> createCurrentPatient(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Patient patient
    ) {
        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(patientService.createCurrentPatient(userId, patient));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentPatient(
            @RequestHeader("X-User-Id") Long userId
    ) {
        try {

            return ResponseEntity.ok(
                    patientService
                            .getPatientByUserId(
                                    userId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientById(
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
                        patientService
                                .getOwnedPatientById(
                                        id,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    patientService
                            .getPatientById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPatientByUserId(
            @PathVariable Long userId,
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
                        patientService
                                .getOwnedPatientByUserId(
                                        userId,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    patientService
                            .getPatientByUserId(
                                    userId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllPatients(
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

                Patient patient =
                        patientService
                                .getPatientByUserId(
                                        authenticatedUserId
                                );

                return ResponseEntity.ok(
                        List.of(patient)
                );
            }

            return ResponseEntity.ok(
                    patientService
                            .getAllPatients()
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePatient(
            @PathVariable Long id,
            @RequestBody Patient patient,
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

                patientService
                        .getOwnedPatientById(
                                id,
                                authenticatedUserId
                        );
            }

            return ResponseEntity.ok(
                    patientService
                            .updatePatient(
                                    id,
                                    patient
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
