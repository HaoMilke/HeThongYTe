package com.clinic.prescription.client;

import com.clinic.prescription.dto.MedicalRecordResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class MedicalRecordClient {

    private static final String MEDICAL_SERVICE =
            "http://MEDICAL-SERVICE";

    private final RestTemplate restTemplate;

    public MedicalRecordClient(
            RestTemplate restTemplate
    ) {
        this.restTemplate = restTemplate;
    }

    public MedicalRecordResponse getMedicalRecord(
            Long medicalRecordId
    ) {
        try {
            MedicalRecordResponse response =
                    restTemplate.getForObject(
                            MEDICAL_SERVICE
                                    + "/api/medical-records/"
                                    + medicalRecordId,
                            MedicalRecordResponse.class
                    );

            if (response == null) {
                throw new RuntimeException(
                        "Không tìm thấy hồ sơ bệnh án"
                );
            }

            return response;

        } catch (RestClientException e) {
            throw new RuntimeException(
                    "Không thể lấy thông tin hồ sơ bệnh án"
            );
        }
    }
}