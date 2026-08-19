package com.timetracking.api.record;

import com.timetracking.api.record.TimeRecordDtos.CreateRecordRequest;
import com.timetracking.api.record.TimeRecordDtos.RecordResponse;
import com.timetracking.api.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/records")
public class TimeRecordController {

    private final TimeRecordService timeRecordService;

    public TimeRecordController(TimeRecordService timeRecordService) {
        this.timeRecordService = timeRecordService;
    }

    @PostMapping
    public ResponseEntity<RecordResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                 @Valid @RequestBody CreateRecordRequest request) {
        RecordResponse response = timeRecordService.create(principal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Page<RecordResponse>> myRecords(@AuthenticationPrincipal UserPrincipal principal,
                                                          Pageable pageable) {
        return ResponseEntity.ok(timeRecordService.findMyRecords(principal.getUser().getId(), pageable));
    }
}
