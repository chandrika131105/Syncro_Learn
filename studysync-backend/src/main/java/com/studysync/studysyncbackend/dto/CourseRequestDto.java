package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseRequestDto {
    @jakarta.validation.constraints.NotBlank(message = "Title is required")
    private String title;

    @jakarta.validation.constraints.NotBlank(message = "Description is required")
    @jakarta.validation.constraints.Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @jakarta.validation.constraints.NotNull(message = "Price is required")
    @jakarta.validation.constraints.Min(value = 0, message = "Price cannot be negative")
    private BigDecimal price;

    @JsonProperty("isPublished")
    private boolean isPublished;

    @Pattern(regexp = "^(https?://.+)?$", message = "Thumbnail URL must start with http:// or https://")
    private String thumbnail;

    @jakarta.validation.constraints.NotBlank(message = "Category is required")
    private String category;

    @jakarta.validation.constraints.NotBlank(message = "Level is required")
    private String level;
    // We don't include tutorId here, as it's determined from the logged-in user
}