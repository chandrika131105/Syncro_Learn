package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ModuleResponseDto {
    private Long id;
    private String title;
    private String content;
    private String videoUrl;
    private String notesUrl;
    private Long courseId; // Just include the ID, not the full course object
    private QuizResponseDto quiz;
    private double lastPosition;
    private int percentage;
    private boolean completed;
}