package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseResponseDto {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    @JsonProperty("isPublished")
    private boolean isPublished;
    private String thumbnail;
    private String category;
    private String level;
    private TutorDto tutor;
    private List<ModuleResponseDto> modules;
}