package com.clinic.payment.client;

import com.clinic.payment.dto.PatientResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class PatientClient {

    private static final String PATIENT_SERVICE =
            "http://PATIENT-SERVICE";

    private final RestTemplate restTemplate;

    public PatientClient(
            RestTemplate restTemplate
    ) {
        this.restTemplate = restTemplate;
    }

    public PatientResponse getPatientByUserId(
            Long userId
    ) {

        String url =
                PATIENT_SERVICE
                        + "/api/patients/user/"
                        + userId;

        try {

            PatientResponse response =
                    restTemplate.getForObject(
                            url,
                            PatientResponse.class
                    );

            if (response == null) {
                throw new RuntimeException(
                        "Không tìm thấy hồ sơ bệnh nhân"
                );
            }

            return response;

        } catch (RestClientException e) {

            throw new RuntimeException(
                    "Không thể lấy hồ sơ bệnh nhân"
            );
        }
    }

    public Long getPatientIdByUserId(
            Long userId
    ) {

        PatientResponse patient =
                getPatientByUserId(userId);

        return patient.getId();
    }
}