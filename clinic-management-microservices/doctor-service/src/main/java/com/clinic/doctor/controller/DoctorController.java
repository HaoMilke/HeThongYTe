package com.clinic.doctor.controller;

import com.clinic.doctor.entity.Doctor;
import com.clinic.doctor.service.DoctorService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @PostMapping
    public ResponseEntity<?> createDoctor(@RequestBody Doctor doctor) {
        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(doctorService.createDoctor(doctor));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(doctorService.getDoctorById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getDoctorByUserId(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(
                    doctorService.getDoctorByUserId(userId)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<?> getBySpecialization(
            @PathVariable String specialization
    ) {
        return ResponseEntity.ok(
                doctorService.getDoctorsBySpecialization(specialization)
        );
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableDoctors() {
        return ResponseEntity.ok(
                doctorService.getAvailableDoctors()
        );
    }

    @PutMapping("/{id}")
public ResponseEntity<?> updateDoctor(
        @PathVariable Long id,
        @RequestBody Doctor doctor,
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
                    doctorService.updateOwnedDoctor(
                            id,
                            authenticatedUserId,
                            doctor
                    )
            );
        }

        return ResponseEntity.ok(
                doctorService.updateDoctor(
                        id,
                        doctor
                )
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(e.getMessage());
    }
}

private boolean isDoctorOnly(String roles) {

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