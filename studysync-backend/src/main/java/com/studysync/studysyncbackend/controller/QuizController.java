package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.dto.QuizResultDto;
import com.studysync.studysyncbackend.dto.QuizSubmissionDto;
import com.studysync.studysyncbackend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/{quizId}/submit")
    public ResponseEntity<QuizResultDto> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody QuizSubmissionDto submission) {

        QuizResultDto result = quizService.calculateResult(
                Objects.requireNonNull(quizId),
                Objects.requireNonNull(submission.getAnswers()));
        return ResponseEntity.ok(result);
    }
}
