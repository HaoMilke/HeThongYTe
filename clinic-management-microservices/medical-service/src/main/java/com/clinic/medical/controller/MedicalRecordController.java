package com.clinic.medical.controller;

import com.clinic.medical.entity.MedicalRecord;
import com.clinic.medical.service.MedicalRecordService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(
            MedicalRecordService medicalRecordService
    ) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody MedicalRecord record,
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
                                medicalRecordService
                                        .createDoctorOwnedMedicalRecord(
                                                authenticatedUserId,
                                                record
                                        )
                        );
            }

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            medicalRecordService
                                    .createMedicalRecord(record)
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
                        medicalRecordService
                                .getOwnedRecordById(
                                        id,
                                        authenticatedUserId
                                )
                );
            }

            if (isDoctorOnly(roles)) {
                return ResponseEntity.ok(
                        medicalRecordService
                                .getDoctorOwnedRecordById(
                                        id,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    medicalRecordService.getById(id)
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
                        medicalRecordService
                                .getOwnedRecordByAppointmentId(
                                        appointmentId,
                                        authenticatedUserId
                                )
                );
            }

            if (isDoctorOnly(roles)) {
                return ResponseEntity.ok(
                        medicalRecordService
                                .getDoctorOwnedRecordByAppointmentId(
                                        appointmentId,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    medicalRecordService
                            .getByAppointmentId(appointmentId)
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
                        medicalRecordService
                                .getAuthenticatedPatientId(
                                        authenticatedUserId
                                );

                if (!ownedPatientId.equals(patientId)) {
                    throw new RuntimeException(
                            "Bạn không có quyền truy cập hồ sơ bệnh án của bệnh nhân này"
                    );
                }
            }

            /*
             * Doctor không được dùng patientId để xem toàn bộ
             * hồ sơ của bệnh nhân. Doctor chỉ xem record của mình.
             */
            if (isDoctorOnly(roles)) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "Bác sĩ không có quyền xem toàn bộ bệnh án theo patientId"
                        );
            }

            return ResponseEntity.ok(
                    medicalRecordService
                            .getByPatientId(patientId)
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
                                "Bệnh nhân không có quyền xem danh sách bệnh án theo bác sĩ"
                        );
            }

            if (isDoctorOnly(roles)) {

                Long ownedDoctorId =
                        medicalRecordService
                                .getAuthenticatedDoctorId(
                                        authenticatedUserId
                                );

                if (!ownedDoctorId.equals(doctorId)) {
                    throw new RuntimeException(
                            "Bạn không có quyền xem bệnh án của bác sĩ khác"
                    );
                }
            }

            return ResponseEntity.ok(
                    medicalRecordService
                            .getByDoctorId(doctorId)
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
                        medicalRecordService
                                .getOwnedRecords(
                                        authenticatedUserId
                                )
                );
            }

            if (isDoctorOnly(roles)) {
                return ResponseEntity.ok(
                        medicalRecordService
                                .getDoctorOwnedRecords(
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    medicalRecordService.getAll()
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
            @RequestBody MedicalRecord record,
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
                                "Bệnh nhân không có quyền sửa hồ sơ bệnh án"
                        );
            }

            if (isDoctorOnly(roles)) {
                return ResponseEntity.ok(
                        medicalRecordService
                                .updateDoctorOwnedMedicalRecord(
                                        id,
                                        authenticatedUserId,
                                        record
                                )
                );
            }

            return ResponseEntity.ok(
                    medicalRecordService
                            .updateMedicalRecord(
                                    id,
                                    record
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