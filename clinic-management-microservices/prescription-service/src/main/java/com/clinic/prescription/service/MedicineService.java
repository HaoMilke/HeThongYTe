package com.clinic.prescription.service;

import com.clinic.prescription.entity.Medicine;
import com.clinic.prescription.repository.MedicineRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(
            MedicineRepository medicineRepository
    ) {
        this.medicineRepository = medicineRepository;
    }

    public Medicine createMedicine(
            Medicine medicine
    ) {

        validateMedicine(medicine);

        String name = medicine.getName().trim();

        if (medicineRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException(
                    "Thuốc đã tồn tại"
            );
        }

        medicine.setId(null);
        medicine.setName(name);
        medicine.setUnit(
                medicine.getUnit().trim()
        );

        if (medicine.getActive() == null) {
            medicine.setActive(true);
        }

        return medicineRepository.save(
                medicine
        );
    }

    public Medicine getById(
            Long id
    ) {

        return medicineRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy thuốc"
                        )
                );
    }

    public List<Medicine> getAll() {
        return medicineRepository.findAll();
    }

    public List<Medicine> getActiveMedicines() {
        return medicineRepository
                .findByActiveTrue();
    }

    public List<Medicine> search(
            String keyword
    ) {

        if (keyword == null
                || keyword.isBlank()) {
            return medicineRepository.findAll();
        }

        return medicineRepository
                .findByNameContainingIgnoreCase(
                        keyword.trim()
                );
    }

    public Medicine updateMedicine(
            Long id,
            Medicine request
    ) {

        Medicine medicine =
                getById(id);

        if (request.getName() != null
                && !request.getName().isBlank()) {

            String newName =
                    request.getName().trim();

            medicineRepository
                    .findByNameIgnoreCase(newName)
                    .ifPresent(existing -> {

                        if (!existing.getId().equals(id)) {
                            throw new RuntimeException(
                                    "Tên thuốc đã tồn tại"
                            );
                        }
                    });

            medicine.setName(newName);
        }

        if (request.getUnit() != null
                && !request.getUnit().isBlank()) {

            medicine.setUnit(
                    request.getUnit().trim()
            );
        }

        if (request.getPrice() != null) {

            if (request.getPrice()
                    .compareTo(BigDecimal.ZERO) <= 0) {

                throw new RuntimeException(
                        "Giá thuốc phải lớn hơn 0"
                );
            }

            medicine.setPrice(
                    request.getPrice()
            );
        }

        if (request.getStockQuantity() != null) {

            if (request.getStockQuantity() < 0) {
                throw new RuntimeException(
                        "Số lượng tồn kho không được âm"
                );
            }

            medicine.setStockQuantity(
                    request.getStockQuantity()
            );
        }

        if (request.getActive() != null) {
            medicine.setActive(
                    request.getActive()
            );
        }

        if (request.getDescription() != null) {
            medicine.setDescription(
                    request.getDescription()
            );
        }

        return medicineRepository.save(
                medicine
        );
    }

    public Medicine deactivateMedicine(
            Long id
    ) {

        Medicine medicine =
                getById(id);

        medicine.setActive(false);

        return medicineRepository.save(
                medicine
        );
    }

    public Medicine updateStock(
            Long id,
            Integer stockQuantity
    ) {

        if (stockQuantity == null
                || stockQuantity < 0) {

            throw new RuntimeException(
                    "Số lượng tồn kho không hợp lệ"
            );
        }

        Medicine medicine =
                getById(id);

        medicine.setStockQuantity(
                stockQuantity
        );

        return medicineRepository.save(
                medicine
        );
    }

    private void validateMedicine(
            Medicine medicine
    ) {

        if (medicine == null) {
            throw new RuntimeException(
                    "Thông tin thuốc không hợp lệ"
            );
        }

        if (medicine.getName() == null
                || medicine.getName().isBlank()) {

            throw new RuntimeException(
                    "Tên thuốc không được để trống"
            );
        }

        if (medicine.getUnit() == null
                || medicine.getUnit().isBlank()) {

            throw new RuntimeException(
                    "Đơn vị thuốc không được để trống"
            );
        }

        if (medicine.getPrice() == null
                || medicine.getPrice()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Giá thuốc phải lớn hơn 0"
            );
        }

        if (medicine.getStockQuantity() == null
                || medicine.getStockQuantity() < 0) {

            throw new RuntimeException(
                    "Số lượng tồn kho không được âm"
            );
        }
    }
}