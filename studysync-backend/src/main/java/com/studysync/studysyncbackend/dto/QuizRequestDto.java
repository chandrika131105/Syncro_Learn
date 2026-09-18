package com.studysync.studysyncbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizRequestDto {
    @NotBlank(message = "Quiz title is required")
    private String title;

    @NotEmpty(message = "Quiz must have at least one question")
    private List<QuestionDto> questions;
}
