package com.timetracking.api.record;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface TimeRecordRepository extends JpaRepository<TimeRecord, Long> {

    Page<TimeRecord> findByUserIdOrderByRecordedAtDesc(Long userId, Pageable pageable);

    @Query("""
            SELECT r FROM TimeRecord r
            WHERE (:userId IS NULL OR r.user.id = :userId)
              AND (CAST(:from AS timestamp) IS NULL OR r.recordedAt >= :from)
              AND (CAST(:to AS timestamp) IS NULL OR r.recordedAt <= :to)
            ORDER BY r.recordedAt DESC
            """)
    Page<TimeRecord> findAllFiltered(@Param("userId") Long userId,
                                     @Param("from") Instant from,
                                     @Param("to") Instant to,
                                     Pageable pageable);
}
