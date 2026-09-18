package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponseDto {
    private Long id;
    private Long userId;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime enrolledAt;
    private int progress;
    private LocalDateTime lastAccessed;
    private CourseResponseDto course; // Added full course object
}
