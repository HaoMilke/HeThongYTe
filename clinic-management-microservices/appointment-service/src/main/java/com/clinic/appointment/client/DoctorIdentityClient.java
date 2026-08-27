package com.clinic.appointment.client;

import com.clinic.appointment.dto.DoctorResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class DoctorIdentityClient {

    private static final String DOCTOR_SERVICE =
            "http://DOCTOR-SERVICE";

    private final RestTemplate restTemplate;

    public DoctorIdentityClient(
            RestTemplate restTemplate
    ) {
        this.restTemplate = restTemplate;
    }

    public DoctorResponse getDoctorByUserId(
            Long userId
    ) {

        String url =
                DOCTOR_SERVICE
                        + "/api/doctors/user/"
                        + userId;

        try {

            DoctorResponse response =
                    restTemplate.getForObject(
                            url,
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

        DoctorResponse doctor =
                getDoctorByUserId(
                        userId
                );

        return doctor.getId();
    }
}