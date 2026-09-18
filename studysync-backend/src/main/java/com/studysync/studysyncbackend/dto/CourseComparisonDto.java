package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List; // For module titles

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseComparisonDto {

    private Long id;
    private String title;
    private BigDecimal price;
    private TutorDto tutor; // Re-use the existing TutorDto

    // Placeholder for module details - just titles for now
    private List<String> moduleTitles;

    // --- Placeholders for fields mentioned in PRD ---
    // These will require more features to be built first

    // private Double tutorRating; // Requires a rating system
    // private String gamificationFeatures; // Requires gamification system
    // private boolean liveSessionAvailable; // Requires live session scheduling

    // Constructor or Builder can be used to create this DTO
}