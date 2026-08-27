package com.clinic.appointment.service;

import com.clinic.appointment.client.DoctorClient;
import com.clinic.appointment.client.PatientClient;
import com.clinic.appointment.entity.Appointment;
import com.clinic.appointment.entity.AppointmentStatus;
import com.clinic.appointment.repository.AppointmentRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.clinic.appointment.client.DoctorIdentityClient;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorClient doctorClient;
    private final PatientClient patientClient;
    private final DoctorIdentityClient doctorIdentityClient;

    public AppointmentService(
        AppointmentRepository appointmentRepository,
        DoctorClient doctorClient,
        PatientClient patientClient,
        DoctorIdentityClient doctorIdentityClient
) {
    this.appointmentRepository =
            appointmentRepository;

    this.doctorClient =
            doctorClient;

    this.patientClient =
            patientClient;

    this.doctorIdentityClient =
            doctorIdentityClient;
}
    public Appointment createAppointment(
            Appointment appointment
    ) {

        if (appointment.getDoctorId() == null) {
            throw new RuntimeException(
                    "Doctor ID không được để trống"
            );
        }

        if (appointment.getPatientId() == null) {
            throw new RuntimeException(
                    "Patient ID không được để trống"
            );
        }

        if (appointment.getAppointmentTime() == null) {
            throw new RuntimeException(
                    "Thời gian khám không được để trống"
            );
        }

        doctorClient.validateDoctorAvailability(
                appointment.getDoctorId(),
                appointment.getAppointmentTime()
        );

        boolean doctorBusy =
                appointmentRepository
                        .existsByDoctorIdAndAppointmentTime(
                                appointment.getDoctorId(),
                                appointment.getAppointmentTime()
                        );

        if (doctorBusy) {
            throw new RuntimeException(
                    "Bác sĩ đã có lịch khám vào thời điểm này"
            );
        }

        appointment.setStatus(
                AppointmentStatus.PENDING
        );

        return appointmentRepository.save(
                appointment
        );
    }

    public Appointment getAppointmentById(
            Long id
    ) {

        return appointmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy lịch hẹn"
                        )
                );
    }

    public List<Appointment> getByPatientId(
            Long patientId
    ) {

        return appointmentRepository
                .findByPatientId(
                        patientId
                );
    }

    public List<Appointment> getByDoctorId(
            Long doctorId
    ) {

        return appointmentRepository
                .findByDoctorId(
                        doctorId
                );
    }

    public List<Appointment> getAllAppointments() {

        return appointmentRepository.findAll();
    }

    public Appointment confirmAppointment(
            Long id
    ) {

        return changeStatus(
                id,
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED
        );
    }

    public Appointment checkInAppointment(
            Long id
    ) {

        return changeStatus(
                id,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.CHECKED_IN
        );
    }

    public Appointment markWaiting(
            Long id
    ) {

        return changeStatus(
                id,
                AppointmentStatus.CHECKED_IN,
                AppointmentStatus.WAITING
        );
    }

    public Appointment startExam(
            Long id
    ) {

        return changeStatus(
                id,
                AppointmentStatus.WAITING,
                AppointmentStatus.EXAMINING
        );
    }

    public Appointment completeAppointment(
            Long id
    ) {

        return changeStatus(
                id,
                AppointmentStatus.EXAMINING,
                AppointmentStatus.COMPLETED
        );
    }

    public Appointment cancelAppointment(
            Long id
    ) {

        Appointment appointment =
                getAppointmentById(id);

        if (appointment.getStatus()
                != AppointmentStatus.PENDING
                &&
            appointment.getStatus()
                != AppointmentStatus.CONFIRMED) {

            throw new RuntimeException(
                    "Chỉ lịch PENDING hoặc CONFIRMED mới có thể hủy"
            );
        }

        appointment.setStatus(
                AppointmentStatus.CANCELLED
        );

        return appointmentRepository.save(
                appointment
        );
    }

    public Appointment markNoShow(
            Long id
    ) {

        Appointment appointment =
                getAppointmentById(id);

        if (appointment.getStatus()
                != AppointmentStatus.CONFIRMED) {

            throw new RuntimeException(
                    "Chỉ lịch CONFIRMED mới có thể chuyển sang NO_SHOW"
            );
        }

        appointment.setStatus(
                AppointmentStatus.NO_SHOW
        );

        return appointmentRepository.save(
                appointment
        );
    }

    public List<Appointment>
    getDoctorAppointmentsByDate(
            Long doctorId,
            LocalDate date
    ) {

        LocalDateTime start =
                date.atStartOfDay();

        LocalDateTime end =
                date.plusDays(1)
                        .atStartOfDay();

        return appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetween(
                        doctorId,
                        start,
                        end
                );
    }

    public Appointment rescheduleAppointment(
            Long id,
            LocalDateTime newAppointmentTime
    ) {

        Appointment appointment =
                getAppointmentById(id);

        if (appointment.getStatus()
                == AppointmentStatus.COMPLETED
                ||
            appointment.getStatus()
                == AppointmentStatus.CANCELLED
                ||
            appointment.getStatus()
                == AppointmentStatus.NO_SHOW) {

            throw new RuntimeException(
                    "Không thể đổi lịch ở trạng thái hiện tại"
            );
        }

        doctorClient.validateDoctorAvailability(
                appointment.getDoctorId(),
                newAppointmentTime
        );

        boolean doctorBusy =
                appointmentRepository
                        .existsByDoctorIdAndAppointmentTimeAndIdNot(
                                appointment.getDoctorId(),
                                newAppointmentTime,
                                id
                        );

        if (doctorBusy) {
            throw new RuntimeException(
                    "Bác sĩ đã có lịch khám vào thời điểm mới"
            );
        }

        appointment.setAppointmentTime(
                newAppointmentTime
        );

        return appointmentRepository.save(
                appointment
        );
    }

    public boolean isSlotAvailable(
            Long doctorId,
            LocalDateTime appointmentTime
    ) {

        try {

            doctorClient.validateDoctorAvailability(
                    doctorId,
                    appointmentTime
            );

        } catch (RuntimeException e) {

            return false;
        }

        return !appointmentRepository
                .existsByDoctorIdAndAppointmentTime(
                        doctorId,
                        appointmentTime
                );
    }

    public Long getAuthenticatedPatientId(
            Long authenticatedUserId
    ) {

        if (authenticatedUserId == null) {

            throw new RuntimeException(
                    "Không xác định được người dùng hiện tại"
            );
        }

        return patientClient
                .getPatientIdByUserId(
                        authenticatedUserId
                );
    }

    public Appointment getOwnedAppointmentById(
            Long appointmentId,
            Long authenticatedUserId
    ) {

        Long patientId =
                getAuthenticatedPatientId(
                        authenticatedUserId
                );

        Appointment appointment =
                getAppointmentById(
                        appointmentId
                );

        if (!patientId.equals(
                appointment.getPatientId()
        )) {

            throw new RuntimeException(
                    "Bạn không có quyền truy cập lịch hẹn này"
            );
        }

        return appointment;
    }

    public List<Appointment> getOwnedAppointments(
            Long authenticatedUserId
    ) {

        Long patientId =
                getAuthenticatedPatientId(
                        authenticatedUserId
                );

        return getByPatientId(
                patientId
        );
    }

    public Appointment cancelOwnedAppointment(
            Long appointmentId,
            Long authenticatedUserId
    ) {

        getOwnedAppointmentById(
                appointmentId,
                authenticatedUserId
        );

        return cancelAppointment(
                appointmentId
        );
    }

    public Appointment rescheduleOwnedAppointment(
            Long appointmentId,
            Long authenticatedUserId,
            LocalDateTime newAppointmentTime
    ) {

        getOwnedAppointmentById(
                appointmentId,
                authenticatedUserId
        );

        return rescheduleAppointment(
                appointmentId,
                newAppointmentTime
        );
    }

    public Appointment startOwnedExam(
        Long appointmentId,
        Long authenticatedUserId
) {

    Appointment appointment =
            getDoctorOwnedAppointmentById(
                    appointmentId,
                    authenticatedUserId
            );

    if (appointment.getStatus()
            != AppointmentStatus.WAITING) {

        throw new RuntimeException(
                "Trạng thái hiện tại phải là WAITING để chuyển sang EXAMINING"
        );
    }

    appointment.setStatus(
            AppointmentStatus.EXAMINING
    );

    return appointmentRepository.save(
            appointment
    );
}

public Appointment completeOwnedAppointment(
        Long appointmentId,
        Long authenticatedUserId
) {

    Appointment appointment =
            getDoctorOwnedAppointmentById(
                    appointmentId,
                    authenticatedUserId
            );

    if (appointment.getStatus()
            != AppointmentStatus.EXAMINING) {

        throw new RuntimeException(
                "Trạng thái hiện tại phải là EXAMINING để chuyển sang COMPLETED"
        );
    }

    appointment.setStatus(
            AppointmentStatus.COMPLETED
    );

    return appointmentRepository.save(
            appointment
    );
}

    private Appointment changeStatus(
            Long id,
            AppointmentStatus expectedCurrentStatus,
            AppointmentStatus newStatus
    ) {

        Appointment appointment =
                getAppointmentById(id);

        if (appointment.getStatus()
                != expectedCurrentStatus) {

            throw new RuntimeException(
                    "Trạng thái hiện tại phải là "
                            + expectedCurrentStatus
                            + " để chuyển sang "
                            + newStatus
            );
        }

        appointment.setStatus(
                newStatus
        );

        return appointmentRepository.save(
                appointment
        );
    }

    public Long getAuthenticatedDoctorId(
        Long authenticatedUserId
) {

    if (authenticatedUserId == null) {
        throw new RuntimeException(
                "Không xác định được người dùng hiện tại"
        );
    }

    return doctorIdentityClient
            .getDoctorIdByUserId(
                    authenticatedUserId
            );
}

public Appointment getDoctorOwnedAppointmentById(
        Long appointmentId,
        Long authenticatedUserId
) {

    Long doctorId =
            getAuthenticatedDoctorId(
                    authenticatedUserId
            );

    Appointment appointment =
            getAppointmentById(
                    appointmentId
            );

    if (!doctorId.equals(
            appointment.getDoctorId()
    )) {

        throw new RuntimeException(
                "Bạn không có quyền truy cập lịch hẹn của bác sĩ khác"
        );
    }

    return appointment;
}

public List<Appointment> getDoctorOwnedAppointments(
        Long authenticatedUserId
) {

    Long doctorId =
            getAuthenticatedDoctorId(
                    authenticatedUserId
            );

    return getByDoctorId(
            doctorId
    );
}

public List<Appointment> getDoctorOwnedAppointmentsByDate(
        Long authenticatedUserId,
        LocalDate date
) {

    Long doctorId =
            getAuthenticatedDoctorId(
                    authenticatedUserId
            );

    return getDoctorAppointmentsByDate(
            doctorId,
            date
    );
}
}