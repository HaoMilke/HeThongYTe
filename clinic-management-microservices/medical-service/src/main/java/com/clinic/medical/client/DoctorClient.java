package com.clinic.medical.client;

import com.clinic.medical.dto.DoctorResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class DoctorClient {

    private static final String DOCTOR_SERVICE =
            "http://DOCTOR-SERVICE";

    private final RestTemplate restTemplate;

    public DoctorClient(
            RestTemplate restTemplate
    ) {
        this.restTemplate = restTemplate;
    }

    public DoctorResponse getDoctorByUserId(
            Long userId
    ) {

        try {

            DoctorResponse response =
                    restTemplate.getForObject(
                            DOCTOR_SERVICE
                                    + "/api/doctors/user/"
                                    + userId,
                            DoctorResponse.class
                    );

            if (response == null) {
                throw new RuntimeException(
                        "Không tìm thấy hồ sơ bác sĩ"
                );
            }

            return response;

        } catch (RestClientException e) {

            throw new RuntimeException(
                    "Không thể lấy hồ sơ bác sĩ"
            );
        }
    }

    public Long getDoctorIdByUserId(
            Long userId
    ) {

        return getDoctorByUserId(
                userId
        ).getId();
    }
}