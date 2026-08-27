package com.clinic.prescription.controller;

import com.clinic.prescription.entity.Medicine;
import com.clinic.prescription.service.MedicineService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(
            MedicineService medicineService
    ) {
        this.medicineService = medicineService;
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Medicine medicine
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        medicineService.createMedicine(
                                medicine
                        )
                );
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(
                medicineService.getAll()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                medicineService.getById(id)
        );
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActive() {
        return ResponseEntity.ok(
                medicineService.getActiveMedicines()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(
                medicineService.search(keyword)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Medicine medicine
    ) {
        return ResponseEntity.ok(
                medicineService.updateMedicine(
                        id,
                        medicine
                )
        );
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                medicineService.deactivateMedicine(id)
        );
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(
            @PathVariable Long id,
            @RequestParam Integer quantity
    ) {
        return ResponseEntity.ok(
                medicineService.updateStock(
                        id,
                        quantity
                )
        );
    }
}