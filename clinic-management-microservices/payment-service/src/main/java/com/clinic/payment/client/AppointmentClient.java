package com.clinic.payment.client;

import com.clinic.payment.dto.AppointmentResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class AppointmentClient {

    private static final String APPOINTMENT_SERVICE =
            "http://APPOINTMENT-SERVICE";

    private final RestTemplate restTemplate;

    public AppointmentClient(
            RestTemplate restTemplate
    ) {
        this.restTemplate = restTemplate;
    }

    public AppointmentResponse getAppointment(
            Long appointmentId
    ) {
        try {
            AppointmentResponse response =
                    restTemplate.getForObject(
                            APPOINTMENT_SERVICE
                                    + "/api/appointments/"
                                    + appointmentId,
                            AppointmentResponse.class
                    );

            if (response == null) {
                throw new RuntimeException(
                        "Không tìm thấy lịch khám"
                );
            }

            return response;

        } catch (RestClientException e) {
            throw new RuntimeException(
                    "Không thể lấy thông tin lịch khám"
            );
        }
    }
}