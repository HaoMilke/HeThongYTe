package com.clinic.doctor.controller;

import com.clinic.doctor.entity.Specialty;
import com.clinic.doctor.service.SpecialtyService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/specialties")
public class SpecialtyController {

    private final SpecialtyService specialtyService;

    public SpecialtyController(
            SpecialtyService specialtyService
    ) {
        this.specialtyService =
                specialtyService;
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Specialty specialty
    ) {
        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            specialtyService
                                    .createSpecialty(
                                            specialty
                                    )
                    );

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(
                specialtyService.getAll()
        );
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActive() {
        return ResponseEntity.ok(
                specialtyService.getActive()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(
                    specialtyService.getById(id)
            );

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Specialty specialty
    ) {
        try {
            return ResponseEntity.ok(
                    specialtyService
                            .updateSpecialty(
                                    id,
                                    specialty
                            )
            );

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<?> setActive(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        try {
            return ResponseEntity.ok(
                    specialtyService.setActive(
                            id,
                            active
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PatchMapping("/{specialtyId}/doctors/{doctorId}")
    public ResponseEntity<?> assignDoctor(
            @PathVariable Long specialtyId,
            @PathVariable Long doctorId
    ) {
        try {
            return ResponseEntity.ok(
                    specialtyService.assignDoctor(
                            specialtyId,
                            doctorId
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{specialtyId}/doctors")
    public ResponseEntity<?> getDoctors(
            @PathVariable Long specialtyId
    ) {
        try {
            return ResponseEntity.ok(
                    specialtyService
                            .getDoctorsBySpecialty(
                                    specialtyId
                            )
            );

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id
    ) {
        try {
            specialtyService
                    .deleteSpecialty(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}