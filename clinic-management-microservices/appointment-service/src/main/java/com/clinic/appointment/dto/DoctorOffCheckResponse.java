package com.clinic.appointment.dto;

import java.time.LocalDateTime;

public class DoctorOffCheckResponse {

    private Long doctorId;
    private LocalDateTime appointmentTime;
    private Boolean off;

    public DoctorOffCheckResponse() {
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(
            LocalDateTime appointmentTime
    ) {
        this.appointmentTime = appointmentTime;
    }

    public Boolean getOff() {
        return off;
    }

    public void setOff(Boolean off) {
        this.off = off;
    }
}