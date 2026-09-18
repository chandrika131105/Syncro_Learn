package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.*;
import com.studysync.studysyncbackend.model.Module;
import com.studysync.studysyncbackend.model.Question;
import com.studysync.studysyncbackend.model.Quiz;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.QuizRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final GamificationService gamificationService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User)) {
            return null;
        }
        return (User) authentication.getPrincipal();
    }

    @Transactional
    public Quiz createQuiz(Module module, QuizRequestDto quizDto) {
        if (module == null || quizDto == null) {
            throw new IllegalArgumentException("Module and QuizRequestDto must not be null");
        }

        Quiz quiz = Quiz.builder()
                .title(quizDto.getTitle())
                .module(module)
                .build();

        if (quizDto.getQuestions() != null) {
            for (QuestionDto qDto : quizDto.getQuestions()) {
                if (qDto != null) {
                    quiz.addQuestion(mapDtoToQuestion(qDto));
                }
            }
        }

        return Objects.requireNonNull(quizRepository.save(quiz));
    }

    @Transactional
    public Quiz updateQuiz(Quiz quiz, QuizRequestDto quizDto) {
        if (quiz == null || quizDto == null) {
            throw new IllegalArgumentException("Quiz and QuizRequestDto must not be null");
        }

        quiz.setTitle(quizDto.getTitle());

        // Simple strategy: Clear and re-add questions for now
        // A more advanced strategy would involve matching IDs
        quiz.getQuestions().clear();
        if (quizDto.getQuestions() != null) {
            for (QuestionDto qDto : quizDto.getQuestions()) {
                if (qDto != null) {
                    quiz.addQuestion(mapDtoToQuestion(qDto));
                }
            }
        }

        return Objects.requireNonNull(quizRepository.save(quiz));
    }

    public QuizResultDto calculateResult(Long quizId, Map<Long, Integer> userAnswers) {
        if (quizId == null || userAnswers == null) {
            throw new IllegalArgumentException("QuizId and UserAnswers must not be null");
        }

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found"));

        int correctCount = 0;
        List<Question> questions = quiz.getQuestions();

        for (Question question : questions) {
            Integer selectedOption = userAnswers.get(question.getId());
            if (selectedOption != null && selectedOption.equals(question.getCorrectOptionIndex())) {
                correctCount++;
            }
        }

        double percentage = (double) correctCount / questions.size() * 100;
        boolean passed = percentage >= 60.0;

        // --- Gamification Logic ---
        User currentUser = getCurrentUser();
        if (currentUser != null && passed) {
            // Award base points for passing
            gamificationService.addPoints(currentUser.getId(), 10);

            // Special Badge for Perfection
            if (percentage == 100.0) {
                gamificationService.awardBadge(currentUser.getId(), "QUIZ_MASTER");
            }
        }

        return QuizResultDto.builder()
                .totalQuestions(questions.size())
                .correctAnswers(correctCount)
                .percentage(percentage)
                .passed(passed) // 60% pass mark
                .build();
    }

    public QuizResponseDto mapQuizToDto(Quiz quiz) {
        if (quiz == null) {
            return null;
        }

        return QuizResponseDto.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .questions(quiz.getQuestions().stream()
                        .map(this::mapQuestionToDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private Question mapDtoToQuestion(QuestionDto dto) {
        if (dto == null)
            return null;
        return Question.builder()
                .text(dto.getText())
                .options(dto.getOptions())
                .correctOptionIndex(dto.getCorrectOptionIndex())
                .build();
    }

    private QuestionDto mapQuestionToDto(Question question) {
        if (question == null)
            return null;
        return QuestionDto.builder()
                .id(question.getId())
                .text(question.getText())
                .options(question.getOptions())
                // Note: We might want to hide correctOptionIndex for students
                // but for now, we'll include it for the tutor to edit
                .correctOptionIndex(question.getCorrectOptionIndex())
                .build();
    }
}
