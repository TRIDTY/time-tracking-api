package com.timetracking.api.record;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public final class TimeRecordDtos {

    private TimeRecordDtos() {
    }

    public record CreateRecordRequest(
            @NotNull RecordType type,
            @NotNull @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double latitude,
            @NotNull @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double longitude) {
    }

    public record RecordResponse(
            Long id,
            Long userId,
            String userName,
            RecordType type,
            Double latitude,
            Double longitude,
            Instant recordedAt) {

        public static RecordResponse from(TimeRecord record) {
            return new RecordResponse(
                    record.getId(),
                    record.getUser().getId(),
                    record.getUser().getName(),
                    record.getType(),
                    record.getLatitude(),
                    record.getLongitude(),
                    record.getRecordedAt());
        }
    }
}
