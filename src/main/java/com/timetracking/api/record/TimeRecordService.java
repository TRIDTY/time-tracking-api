package com.timetracking.api.record;

import com.timetracking.api.record.TimeRecordDtos.CreateRecordRequest;
import com.timetracking.api.record.TimeRecordDtos.RecordResponse;
import com.timetracking.api.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class TimeRecordService {

    private final TimeRecordRepository timeRecordRepository;

    public TimeRecordService(TimeRecordRepository timeRecordRepository) {
        this.timeRecordRepository = timeRecordRepository;
    }

    @Transactional
    public RecordResponse create(User user, CreateRecordRequest request) {
        TimeRecord record = new TimeRecord(user, request.type(),
                request.latitude(), request.longitude(), Instant.now());
        return RecordResponse.from(timeRecordRepository.save(record));
    }

    @Transactional(readOnly = true)
    public Page<RecordResponse> findMyRecords(Long userId, Pageable pageable) {
        return timeRecordRepository.findByUserIdOrderByRecordedAtDesc(userId, pageable)
                .map(RecordResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<RecordResponse> findAll(Long userId, Instant from, Instant to, Pageable pageable) {
        return timeRecordRepository.findAllFiltered(userId, from, to, pageable)
                .map(RecordResponse::from);
    }
}
