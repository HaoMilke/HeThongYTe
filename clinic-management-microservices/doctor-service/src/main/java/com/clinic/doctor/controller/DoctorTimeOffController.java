package com.clinic.doctor.controller;

import com.clinic.doctor.entity.DoctorTimeOff;
import com.clinic.doctor.service.DoctorService;
import com.clinic.doctor.service.DoctorTimeOffService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
public class DoctorTimeOffController {

    private final DoctorTimeOffService timeOffService;
    private final DoctorService doctorService;

    public DoctorTimeOffController(
            DoctorTimeOffService timeOffService,
            DoctorService doctorService
    ) {
        this.timeOffService = timeOffService;
        this.doctorService = doctorService;
    }

    @PostMapping("/{doctorId}/time-offs")
    public ResponseEntity<?> createTimeOff(
            @PathVariable Long doctorId,
            @RequestBody DoctorTimeOff request,
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

                doctorService.validateDoctorOwnership(
                        doctorId,
                        authenticatedUserId
                );
            }

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            timeOffService.createTimeOff(
                                    doctorId,
                                    request
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{doctorId}/time-offs")
    public ResponseEntity<?> getTimeOffs(
            @PathVariable Long doctorId
    ) {
        try {

            return ResponseEntity.ok(
                    timeOffService.getByDoctor(
                            doctorId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{doctorId}/time-offs/active")
    public ResponseEntity<?> getActiveTimeOffs(
            @PathVariable Long doctorId
    ) {
        try {

            return ResponseEntity.ok(
                    timeOffService.getActiveByDoctor(
                            doctorId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/time-offs/{timeOffId}")
    public ResponseEntity<?> updateTimeOff(
            @PathVariable Long timeOffId,
            @RequestBody DoctorTimeOff request,
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

                Long doctorId =
                        timeOffService
                                .getById(
                                        timeOffId
                                )
                                .getDoctorId();

                doctorService.validateDoctorOwnership(
                        doctorId,
                        authenticatedUserId
                );
            }

            return ResponseEntity.ok(
                    timeOffService.updateTimeOff(
                            timeOffId,
                            request
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @PatchMapping("/time-offs/{timeOffId}/active")
    public ResponseEntity<?> setActive(
            @PathVariable Long timeOffId,
            @RequestParam boolean active,
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

                Long doctorId =
                        timeOffService
                                .getById(
                                        timeOffId
                                )
                                .getDoctorId();

                doctorService.validateDoctorOwnership(
                        doctorId,
                        authenticatedUserId
                );
            }

            return ResponseEntity.ok(
                    timeOffService.setActive(
                            timeOffId,
                            active
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/time-offs/{timeOffId}")
    public ResponseEntity<?> deleteTimeOff(
            @PathVariable Long timeOffId,
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

                Long doctorId =
                        timeOffService
                                .getById(
                                        timeOffId
                                )
                                .getDoctorId();

                doctorService.validateDoctorOwnership(
                        doctorId,
                        authenticatedUserId
                );
            }

            timeOffService.deleteTimeOff(
                    timeOffId
            );

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{doctorId}/off-check")
    public ResponseEntity<?> checkDoctorOff(
            @PathVariable Long doctorId,
            @RequestParam LocalDateTime appointmentTime
    ) {

        boolean off =
                timeOffService.isDoctorOff(
                        doctorId,
                        appointmentTime
                );

        return ResponseEntity.ok(
                Map.of(
                        "doctorId",
                        doctorId,
                        "appointmentTime",
                        appointmentTime,
                        "off",
                        off
                )
        );
    }

    private boolean isDoctorOnly(
            String roles
    ) {

        if (roles == null
                || roles.isBlank()) {

            return false;
        }

        boolean doctor =
                roles.contains(
                        "ROLE_DOCTOR"
                );

        boolean elevated =
                roles.contains(
                        "ROLE_ADMIN"
                )
                        || roles.contains(
                                "ROLE_RECEPTIONIST"
                        );

        return doctor
                && !elevated;
    }
}