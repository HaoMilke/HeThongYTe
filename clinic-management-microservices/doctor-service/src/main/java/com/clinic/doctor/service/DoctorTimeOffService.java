package com.clinic.doctor.service;

import com.clinic.doctor.entity.DoctorTimeOff;
import com.clinic.doctor.repository.DoctorRepository;
import com.clinic.doctor.repository.DoctorTimeOffRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorTimeOffService {

    private final DoctorTimeOffRepository timeOffRepository;
    private final DoctorRepository doctorRepository;

    public DoctorTimeOffService(
            DoctorTimeOffRepository timeOffRepository,
            DoctorRepository doctorRepository
    ) {
        this.timeOffRepository = timeOffRepository;
        this.doctorRepository = doctorRepository;
    }

    public DoctorTimeOff createTimeOff(
            Long doctorId,
            DoctorTimeOff request
    ) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ");
        }

        if (request.getStartTime() == null
                || request.getEndTime() == null) {
            throw new RuntimeException(
                    "Thời gian bắt đầu và kết thúc không được để trống"
            );
        }

        if (!request.getStartTime().isBefore(
                request.getEndTime()
        )) {
            throw new RuntimeException(
                    "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc"
            );
        }

        List<DoctorTimeOff> existingTimeOffs =
                timeOffRepository.findByDoctorIdAndActiveTrue(
                        doctorId
                );

        boolean overlapped = existingTimeOffs.stream()
                .anyMatch(existing ->
                        request.getStartTime()
                                .isBefore(existing.getEndTime())
                                &&
                        request.getEndTime()
                                .isAfter(existing.getStartTime())
                );

        if (overlapped) {
            throw new RuntimeException(
                    "Khoảng nghỉ bị trùng với lịch nghỉ đã tồn tại"
            );
        }

        request.setId(null);
        request.setDoctorId(doctorId);

        if (request.getActive() == null) {
            request.setActive(true);
        }

        return timeOffRepository.save(request);
    }

    public DoctorTimeOff getById(Long id) {
        return timeOffRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy lịch nghỉ"
                        )
                );
    }

    public List<DoctorTimeOff> getByDoctor(
            Long doctorId
    ) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ");
        }

        return timeOffRepository.findByDoctorId(
                doctorId
        );
    }

    public List<DoctorTimeOff> getActiveByDoctor(
            Long doctorId
    ) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ");
        }

        return timeOffRepository
                .findByDoctorIdAndActiveTrue(
                        doctorId
                );
    }

    public DoctorTimeOff updateTimeOff(
            Long id,
            DoctorTimeOff request
    ) {
        DoctorTimeOff timeOff = getById(id);

        if (request.getStartTime() == null
                || request.getEndTime() == null) {
            throw new RuntimeException(
                    "Thời gian bắt đầu và kết thúc không được để trống"
            );
        }

        if (!request.getStartTime().isBefore(
                request.getEndTime()
        )) {
            throw new RuntimeException(
                    "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc"
            );
        }

        List<DoctorTimeOff> existingTimeOffs =
                timeOffRepository.findByDoctorIdAndActiveTrue(
                        timeOff.getDoctorId()
                );

        boolean overlapped = existingTimeOffs.stream()
                .anyMatch(existing ->
                        !existing.getId().equals(id)
                                &&
                        request.getStartTime()
                                .isBefore(existing.getEndTime())
                                &&
                        request.getEndTime()
                                .isAfter(existing.getStartTime())
                );

        if (overlapped) {
            throw new RuntimeException(
                    "Khoảng nghỉ bị trùng với lịch nghỉ đã tồn tại"
            );
        }

        timeOff.setStartTime(
                request.getStartTime()
        );

        timeOff.setEndTime(
                request.getEndTime()
        );

        timeOff.setReason(
                request.getReason()
        );

        if (request.getActive() != null) {
            timeOff.setActive(
                    request.getActive()
            );
        }

        return timeOffRepository.save(
                timeOff
        );
    }

    public DoctorTimeOff setActive(
            Long id,
            boolean active
    ) {
        DoctorTimeOff timeOff = getById(id);

        timeOff.setActive(active);

        return timeOffRepository.save(
                timeOff
        );
    }

    public void deleteTimeOff(Long id) {
        DoctorTimeOff timeOff = getById(id);

        timeOffRepository.delete(
                timeOff
        );
    }

    public boolean isDoctorOff(
            Long doctorId,
            java.time.LocalDateTime appointmentTime
    ) {
        List<DoctorTimeOff> timeOffs =
                timeOffRepository.findByDoctorIdAndActiveTrue(
                        doctorId
                );

        return timeOffs.stream()
                .anyMatch(timeOff ->
                        !appointmentTime.isBefore(
                                timeOff.getStartTime()
                        )
                                &&
                        appointmentTime.isBefore(
                                timeOff.getEndTime()
                        )
                );
    }
}