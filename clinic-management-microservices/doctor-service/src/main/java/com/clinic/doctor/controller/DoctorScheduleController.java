package com.clinic.doctor.controller;

import com.clinic.doctor.entity.DoctorSchedule;
import com.clinic.doctor.service.DoctorScheduleService;
import com.clinic.doctor.service.DoctorService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;

@RestController
@RequestMapping("/api/doctors")
public class DoctorScheduleController {

    private final DoctorScheduleService scheduleService;
    private final DoctorService doctorService;

    public DoctorScheduleController(
            DoctorScheduleService scheduleService,
            DoctorService doctorService
    ) {
        this.scheduleService = scheduleService;
        this.doctorService = doctorService;
    }

    @PostMapping("/{doctorId}/schedules")
    public ResponseEntity<?> createSchedule(
            @PathVariable Long doctorId,
            @RequestBody DoctorSchedule schedule,
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
                            scheduleService.createSchedule(
                                    doctorId,
                                    schedule
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{doctorId}/schedules")
    public ResponseEntity<?> getSchedules(
            @PathVariable Long doctorId
    ) {
        try {

            return ResponseEntity.ok(
                    scheduleService.getSchedulesByDoctor(
                            doctorId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{doctorId}/schedules/active")
    public ResponseEntity<?> getActiveSchedules(
            @PathVariable Long doctorId
    ) {
        try {

            return ResponseEntity.ok(
                    scheduleService
                            .getActiveSchedulesByDoctor(
                                    doctorId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{doctorId}/schedules/day/{dayOfWeek}")
    public ResponseEntity<?> getScheduleByDay(
            @PathVariable Long doctorId,
            @PathVariable DayOfWeek dayOfWeek
    ) {
        try {

            return ResponseEntity.ok(
                    scheduleService.getScheduleByDay(
                            doctorId,
                            dayOfWeek
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/schedules/{scheduleId}")
    public ResponseEntity<?> updateSchedule(
            @PathVariable Long scheduleId,
            @RequestBody DoctorSchedule schedule,
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
                        scheduleService
                                .getScheduleById(
                                        scheduleId
                                )
                                .getDoctorId();

                doctorService.validateDoctorOwnership(
                        doctorId,
                        authenticatedUserId
                );
            }

            return ResponseEntity.ok(
                    scheduleService.updateSchedule(
                            scheduleId,
                            schedule
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @PatchMapping("/schedules/{scheduleId}/active")
    public ResponseEntity<?> setActive(
            @PathVariable Long scheduleId,
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
                        scheduleService
                                .getScheduleById(
                                        scheduleId
                                )
                                .getDoctorId();

                doctorService.validateDoctorOwnership(
                        doctorId,
                        authenticatedUserId
                );
            }

            return ResponseEntity.ok(
                    scheduleService.setActive(
                            scheduleId,
                            active
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/schedules/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(
            @PathVariable Long scheduleId,
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
                        scheduleService
                                .getScheduleById(
                                        scheduleId
                                )
                                .getDoctorId();

                doctorService.validateDoctorOwnership(
                        doctorId,
                        authenticatedUserId
                );
            }

            scheduleService.deleteSchedule(
                    scheduleId
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