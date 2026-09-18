package com.studysync.studysyncbackend.dto;

import jakarta.validation.constraints.NotBlank; // For title validation
import jakarta.validation.constraints.Pattern; // For XSS protection
import jakarta.validation.constraints.Size; // For size validation
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
// Optional: Add URL validation dependency if needed
// import org.hibernate.validator.constraints.URL;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ModuleRequestDto {

    @NotBlank(message = "Module title cannot be empty")
    @Size(min = 1, max = 150, message = "Title must be between 1 and 150 characters")
    private String title;

    @Size(max = 20000, message = "Content cannot exceed 20000 characters") // Limit for text content
    private String content; // Optional text content

    // Prevent XSS: Only allow http/https URLs. Block javascript: etc.
    @Pattern(regexp = "^(https?://.+)?$", message = "Video URL must start with http:// or https://")
    @Size(max = 512, message = "Video URL too long")
    private String videoUrl; // Optional URL from Cloudinary

    // Prevent XSS: Only allow http/https URLs.
    @Pattern(regexp = "^(https?://.+)?$", message = "Notes URL must start with http:// or https://")
    @Size(max = 512, message = "Notes URL too long")
    private String notesUrl; // Optional URL from Cloudinary

    private QuizRequestDto quiz;
}