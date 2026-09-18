package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.dto.EnrollmentRequestDto;
import com.studysync.studysyncbackend.dto.EnrollmentResponseDto;
import com.studysync.studysyncbackend.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<EnrollmentResponseDto> enrollUser(@RequestBody EnrollmentRequestDto request) {
        return ResponseEntity.ok(enrollmentService.enrollUser(request.getCourseId()));
    }

    @GetMapping("/my-enrollments")
    public ResponseEntity<List<EnrollmentResponseDto>> getUserEnrollments() {
        return ResponseEntity.ok(enrollmentService.getCurrentUserEnrollments());
    }

    @GetMapping("/check/{courseId}")
    public ResponseEntity<Boolean> checkEnrollmentStatus(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.isEnrolled(courseId));
    }

    @PutMapping("/{courseId}/progress")
    public ResponseEntity<Void> updateProgress(@PathVariable Long courseId, @RequestParam int progress) {
        enrollmentService.updateProgress(courseId, progress);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/modules/{moduleId}/progress")
    public ResponseEntity<Void> updateModuleProgress(
            @PathVariable Long moduleId,
            @RequestParam double lastPosition,
            @RequestParam int percentage) {
        enrollmentService.updateModuleProgress(moduleId, lastPosition, percentage);
        return ResponseEntity.ok().build();
    }
}
