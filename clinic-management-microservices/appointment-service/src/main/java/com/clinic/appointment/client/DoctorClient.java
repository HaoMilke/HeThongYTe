package com.clinic.appointment.client;

import com.clinic.appointment.dto.DoctorOffCheckResponse;
import com.clinic.appointment.dto.DoctorScheduleResponse;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

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

    public boolean doctorExists(Long doctorId) {
        try {
            restTemplate.getForEntity(
                    DOCTOR_SERVICE
                            + "/api/doctors/"
                            + doctorId,
                    Object.class
            );

            return true;

        } catch (RestClientException e) {
            return false;
        }
    }

    public boolean isDoctorWorkingAt(
            Long doctorId,
            LocalDateTime appointmentTime
    ) {
        DayOfWeek dayOfWeek =
                appointmentTime.getDayOfWeek();

        String url =
                DOCTOR_SERVICE
                        + "/api/doctors/"
                        + doctorId
                        + "/schedules/day/"
                        + dayOfWeek;

        try {
            ResponseEntity<List<DoctorScheduleResponse>> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            null,
                            new ParameterizedTypeReference<
                                    List<DoctorScheduleResponse>
                                    >() {
                            }
                    );

            List<DoctorScheduleResponse> schedules =
                    response.getBody();

            if (schedules == null) {
                schedules = Collections.emptyList();
            }

            LocalTime requestedTime =
                    appointmentTime.toLocalTime();

            return schedules.stream()
                    .filter(schedule ->
                            Boolean.TRUE.equals(
                                    schedule.getActive()
                            )
                    )
                    .anyMatch(schedule ->
                            !requestedTime.isBefore(
                                    schedule.getStartTime()
                            )
                                    &&
                            requestedTime.isBefore(
                                    schedule.getEndTime()
                            )
                    );

        } catch (RestClientException e) {
            throw new RuntimeException(
                    "Không thể kiểm tra lịch làm việc của bác sĩ"
            );
        }
    }

    public boolean isDoctorOff(
            Long doctorId,
            LocalDateTime appointmentTime
    ) {
        String url =
                DOCTOR_SERVICE
                        + "/api/doctors/"
                        + doctorId
                        + "/off-check?appointmentTime="
                        + appointmentTime;

        try {
            DoctorOffCheckResponse response =
                    restTemplate.getForObject(
                            url,
                            DoctorOffCheckResponse.class
                    );

            return response != null
                    && Boolean.TRUE.equals(
                            response.getOff()
                    );

        } catch (RestClientException e) {
            throw new RuntimeException(
                    "Không thể kiểm tra lịch nghỉ của bác sĩ"
            );
        }
    }

    public void validateDoctorAvailability(
            Long doctorId,
            LocalDateTime appointmentTime
    ) {
        if (!doctorExists(doctorId)) {
            throw new RuntimeException(
                    "Bác sĩ không tồn tại"
            );
        }

        if (!isDoctorWorkingAt(
                doctorId,
                appointmentTime
        )) {
            throw new RuntimeException(
                    "Bác sĩ không làm việc vào thời điểm này"
            );
        }

        if (isDoctorOff(
                doctorId,
                appointmentTime
        )) {
            throw new RuntimeException(
                    "Bác sĩ đang nghỉ vào thời điểm này"
            );
        }
    }
}