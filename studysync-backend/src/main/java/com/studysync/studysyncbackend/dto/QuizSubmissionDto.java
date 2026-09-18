package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmissionDto {
    private Long quizId;
    private Map<Long, Integer> answers; // QuestionId -> SelectedOptionIndex
}
