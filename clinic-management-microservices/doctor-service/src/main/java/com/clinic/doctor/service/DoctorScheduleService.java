package com.clinic.doctor.service;

import com.clinic.doctor.entity.DoctorSchedule;
import com.clinic.doctor.repository.DoctorRepository;
import com.clinic.doctor.repository.DoctorScheduleRepository;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;

@Service
public class DoctorScheduleService {

    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;

    public DoctorScheduleService(
            DoctorScheduleRepository scheduleRepository,
            DoctorRepository doctorRepository
    ) {
        this.scheduleRepository = scheduleRepository;
        this.doctorRepository = doctorRepository;
    }

    public DoctorSchedule createSchedule(
            Long doctorId,
            DoctorSchedule schedule
    ) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ");
        }

        if (schedule.getDayOfWeek() == null) {
            throw new RuntimeException(
                    "Ngày làm việc không được để trống"
            );
        }

        if (schedule.getStartTime() == null
                || schedule.getEndTime() == null) {
            throw new RuntimeException(
                    "Giờ bắt đầu và giờ kết thúc không được để trống"
            );
        }

        if (!schedule.getStartTime().isBefore(
                schedule.getEndTime()
        )) {
            throw new RuntimeException(
                    "Giờ bắt đầu phải nhỏ hơn giờ kết thúc"
            );
        }

        if (schedule.getSlotDurationMinutes() == null
                || schedule.getSlotDurationMinutes() <= 0) {
            throw new RuntimeException(
                    "Thời lượng mỗi slot phải lớn hơn 0"
            );
        }

        /*
         * Không dùng derived query so sánh trực tiếp LocalTime
         * với SQL Server TIME vì JDBC có thể bind parameter
         * thành DATETIME, gây lỗi:
         *
         * time and datetime are incompatible
         *
         * Thay vào đó lấy lịch cùng ngày và so sánh trong Java.
         */
        List<DoctorSchedule> sameDaySchedules =
                scheduleRepository
                        .findByDoctorIdAndDayOfWeekAndActiveTrue(
                                doctorId,
                                schedule.getDayOfWeek()
                        );

        boolean duplicated = sameDaySchedules.stream()
                .anyMatch(existing ->
                        existing.getStartTime()
                                .equals(schedule.getStartTime())
                                &&
                        existing.getEndTime()
                                .equals(schedule.getEndTime())
                );

        if (duplicated) {
            throw new RuntimeException(
                    "Lịch làm việc này đã tồn tại"
            );
        }

        schedule.setId(null);
        schedule.setDoctorId(doctorId);

        if (schedule.getActive() == null) {
            schedule.setActive(true);
        }

        return scheduleRepository.save(schedule);
    }

    public List<DoctorSchedule> getSchedulesByDoctor(
            Long doctorId
    ) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException(
                    "Không tìm thấy bác sĩ"
            );
        }

        return scheduleRepository.findByDoctorId(
                doctorId
        );
    }

    public List<DoctorSchedule> getActiveSchedulesByDoctor(
            Long doctorId
    ) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException(
                    "Không tìm thấy bác sĩ"
            );
        }

        return scheduleRepository
                .findByDoctorIdAndActiveTrue(
                        doctorId
                );
    }

    public List<DoctorSchedule> getScheduleByDay(
            Long doctorId,
            DayOfWeek dayOfWeek
    ) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException(
                    "Không tìm thấy bác sĩ"
            );
        }

        return scheduleRepository
                .findByDoctorIdAndDayOfWeekAndActiveTrue(
                        doctorId,
                        dayOfWeek
                );
    }

    public DoctorSchedule getScheduleById(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy lịch làm việc"
                        )
                );
    }

    public DoctorSchedule updateSchedule(
            Long id,
            DoctorSchedule request
    ) {
        DoctorSchedule schedule =
                getScheduleById(id);

        if (request.getDayOfWeek() == null
                || request.getStartTime() == null
                || request.getEndTime() == null) {
            throw new RuntimeException(
                    "Thông tin lịch làm việc không đầy đủ"
            );
        }

        if (!request.getStartTime().isBefore(
                request.getEndTime()
        )) {
            throw new RuntimeException(
                    "Giờ bắt đầu phải nhỏ hơn giờ kết thúc"
            );
        }

        if (request.getSlotDurationMinutes() == null
                || request.getSlotDurationMinutes() <= 0) {
            throw new RuntimeException(
                    "Thời lượng mỗi slot phải lớn hơn 0"
            );
        }

        /*
         * Kiểm tra trùng lịch khi update.
         * Bỏ qua chính schedule đang được sửa.
         */
        List<DoctorSchedule> sameDaySchedules =
                scheduleRepository
                        .findByDoctorIdAndDayOfWeekAndActiveTrue(
                                schedule.getDoctorId(),
                                request.getDayOfWeek()
                        );

        boolean duplicated = sameDaySchedules.stream()
                .anyMatch(existing ->
                        !existing.getId().equals(id)
                                &&
                        existing.getStartTime()
                                .equals(request.getStartTime())
                                &&
                        existing.getEndTime()
                                .equals(request.getEndTime())
                );

        if (duplicated) {
            throw new RuntimeException(
                    "Lịch làm việc này đã tồn tại"
            );
        }

        schedule.setDayOfWeek(
                request.getDayOfWeek()
        );

        schedule.setStartTime(
                request.getStartTime()
        );

        schedule.setEndTime(
                request.getEndTime()
        );

        schedule.setSlotDurationMinutes(
                request.getSlotDurationMinutes()
        );

        if (request.getActive() != null) {
            schedule.setActive(
                    request.getActive()
            );
        }

        return scheduleRepository.save(
                schedule
        );
    }

    public DoctorSchedule setActive(
            Long id,
            boolean active
    ) {
        DoctorSchedule schedule =
                getScheduleById(id);

        schedule.setActive(active);

        return scheduleRepository.save(
                schedule
        );
    }

    public void deleteSchedule(Long id) {
        DoctorSchedule schedule =
                getScheduleById(id);

        scheduleRepository.delete(
                schedule
        );
    }
}