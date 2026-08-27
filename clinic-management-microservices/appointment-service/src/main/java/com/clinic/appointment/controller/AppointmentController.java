package com.clinic.appointment.controller;

import com.clinic.appointment.entity.Appointment;
import com.clinic.appointment.service.AppointmentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(
            AppointmentService appointmentService
    ) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(
            @RequestBody Appointment appointment
    ) {
        try {

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            appointmentService.createAppointment(
                                    appointment
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
                        appointmentService
                                .getOwnedAppointmentById(
                                        id,
                                        authenticatedUserId
                                )
                );
            }

            if (isDoctorOnly(roles)) {

                return ResponseEntity.ok(
                        appointmentService
                                .getDoctorOwnedAppointmentById(
                                        id,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    appointmentService
                            .getAppointmentById(id)
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
                                "Bác sĩ không được truy vấn toàn bộ lịch theo patientId"
                        );
            }

            if (isPatientOnly(roles)) {

                Long ownedPatientId =
                        appointmentService
                                .getAuthenticatedPatientId(
                                        authenticatedUserId
                                );

                if (!ownedPatientId.equals(
                        patientId
                )) {

                    throw new RuntimeException(
                            "Bạn không có quyền truy cập lịch hẹn của bệnh nhân này"
                    );
                }
            }

            return ResponseEntity.ok(
                    appointmentService
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

            if (isDoctorOnly(roles)) {

                Long ownedDoctorId =
                        appointmentService
                                .getAuthenticatedDoctorId(
                                        authenticatedUserId
                                );

                if (!ownedDoctorId.equals(
                        doctorId
                )) {

                    throw new RuntimeException(
                            "Bạn không có quyền xem lịch của bác sĩ khác"
                    );
                }
            }

            return ResponseEntity.ok(
                    appointmentService
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
                        appointmentService
                                .getOwnedAppointments(
                                        authenticatedUserId
                                )
                );
            }

            if (isDoctorOnly(roles)) {

                return ResponseEntity.ok(
                        appointmentService
                                .getDoctorOwnedAppointments(
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    appointmentService
                            .getAllAppointments()
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/doctor/{doctorId}/date/{date}")
    public ResponseEntity<?> getDoctorAppointmentsByDate(
            @PathVariable Long doctorId,
            @PathVariable LocalDate date,
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

                Long ownedDoctorId =
                        appointmentService
                                .getAuthenticatedDoctorId(
                                        authenticatedUserId
                                );

                if (!ownedDoctorId.equals(
                        doctorId
                )) {

                    throw new RuntimeException(
                            "Bạn không có quyền xem lịch của bác sĩ khác"
                    );
                }
            }

            return ResponseEntity.ok(
                    appointmentService
                            .getDoctorAppointmentsByDate(
                                    doctorId,
                                    date
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> checkAvailableSlot(
            @RequestParam Long doctorId,
            @RequestParam LocalDateTime appointmentTime
    ) {

        boolean available =
                appointmentService.isSlotAvailable(
                        doctorId,
                        appointmentTime
                );

        return ResponseEntity.ok(
                Map.of(
                        "doctorId", doctorId,
                        "appointmentTime", appointmentTime,
                        "available", available
                )
        );
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<?> confirm(
            @PathVariable Long id
    ) {

        return execute(() ->
                appointmentService
                        .confirmAppointment(id)
        );
    }

    @PatchMapping("/{id}/check-in")
    public ResponseEntity<?> checkIn(
            @PathVariable Long id
    ) {

        return execute(() ->
                appointmentService
                        .checkInAppointment(id)
        );
    }

    @PatchMapping("/{id}/waiting")
    public ResponseEntity<?> waiting(
            @PathVariable Long id
    ) {

        return execute(() ->
                appointmentService
                        .markWaiting(id)
        );
    }

  @PatchMapping("/{id}/start-exam")
public ResponseEntity<?> startExam(
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

        if (isDoctorOnly(roles)) {

            return ResponseEntity.ok(
                    appointmentService
                            .startOwnedExam(
                                    id,
                                    authenticatedUserId
                            )
            );
        }

        return ResponseEntity.ok(
                appointmentService
                        .startExam(id)
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}

    @PatchMapping("/{id}/complete")
public ResponseEntity<?> complete(
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

        if (isDoctorOnly(roles)) {

            return ResponseEntity.ok(
                    appointmentService
                            .completeOwnedAppointment(
                                    id,
                                    authenticatedUserId
                            )
            );
        }

        return ResponseEntity.ok(
                appointmentService
                        .completeAppointment(id)
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(
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
                        appointmentService
                                .cancelOwnedAppointment(
                                        id,
                                        authenticatedUserId
                                )
                );
            }

            return ResponseEntity.ok(
                    appointmentService
                            .cancelAppointment(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/no-show")
    public ResponseEntity<?> noShow(
            @PathVariable Long id
    ) {

        return execute(() ->
                appointmentService
                        .markNoShow(id)
        );
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<?> reschedule(
            @PathVariable Long id,
            @RequestParam LocalDateTime appointmentTime,
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
                        appointmentService
                                .rescheduleOwnedAppointment(
                                        id,
                                        authenticatedUserId,
                                        appointmentTime
                                )
                );
            }

            return ResponseEntity.ok(
                    appointmentService
                            .rescheduleAppointment(
                                    id,
                                    appointmentTime
                            )
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

    private ResponseEntity<?> execute(
            AppointmentAction action
    ) {

        try {

            return ResponseEntity.ok(
                    action.run()
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @FunctionalInterface
    private interface AppointmentAction {

        Appointment run();
    }
}