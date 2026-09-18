package com.studysync.studysyncbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private Long id;

    @NotBlank(message = "Question text is required")
    private String text;

    @NotEmpty(message = "At least two options are required")
    private List<String> options;

    @NotNull(message = "Correct option index is required")
    private Integer correctOptionIndex;
}
