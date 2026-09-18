package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.model.Certificate;

import com.studysync.studysyncbackend.dto.EnrollmentResponseDto;
import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.model.Enrollment;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.CourseRepository;
import com.studysync.studysyncbackend.repository.EnrollmentRepository;
import com.studysync.studysyncbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final com.studysync.studysyncbackend.repository.ModuleProgressRepository moduleProgressRepository;
    private final com.studysync.studysyncbackend.repository.ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseService courseService;
    private final GamificationService gamificationService;
    private final CertificateService certificateService;
    private final EmailService emailService;

    @Transactional
    public EnrollmentResponseDto enrollUser(Long courseId) {
        User currentUser = getCurrentUser();

        // Ensure we have the fresh user entity attached to the session
        User user = userRepository.findById(Objects.requireNonNull(currentUser.getId()))
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Course course = courseRepository.findById(Objects.requireNonNull(courseId))
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));

        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            throw new IllegalStateException("User is already enrolled in this course.");
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(Objects.requireNonNull(enrollment));

        // Send Welcome Email (async ideally, but sync for now)
        try {
            String tutorName = course.getTutor() != null
                    ? (course.getTutor().getFirstName() + " " + course.getTutor().getLastName())
                    : "Your Tutor";
            emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName(), course.getTitle(), tutorName);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

        // --- Gamification ---
        // Award badge if this is their first enrollment ever
        long enrollmentCount = enrollmentRepository.countByUserId(user.getId());
        if (enrollmentCount == 1) {
            // Use idempotent badge awarding to handle potential race conditions
            if (gamificationService.awardBadgeIfNotExists(user.getId(), "FIRST_STEPS")) {
                gamificationService.addPoints(user.getId(), 50); // Welcome bonus points
            }
        }

        return mapToDto(savedEnrollment);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponseDto> getCurrentUserEnrollments() {
        User currentUser = getCurrentUser();
        return enrollmentRepository.findByUserId(currentUser.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isEnrolled(Long courseId) {
        User currentUser = getCurrentUser();
        return enrollmentRepository.existsByUserIdAndCourseId(currentUser.getId(), courseId);
    }

    @Transactional
    public void updateProgress(Long courseId, int progress) {
        User currentUser = getCurrentUser();
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(currentUser.getId(), courseId)
                .orElseThrow(() -> new EntityNotFoundException("Enrollment not found"));

        enrollment.setProgress(progress);
        enrollment.setLastAccessed(java.time.LocalDateTime.now());
        enrollmentRepository.save(enrollment);
    }

    @Transactional
    public void updateModuleProgress(Long moduleId, double lastPosition, int percentage) {
        User currentUser = getCurrentUser();
        com.studysync.studysyncbackend.model.Module module = moduleRepository.findById(Objects.requireNonNull(moduleId))
                .orElseThrow(() -> new EntityNotFoundException("Module not found"));

        com.studysync.studysyncbackend.model.ModuleProgress progress = moduleProgressRepository
                .findByUserIdAndModuleId(currentUser.getId(), moduleId)
                .orElse(com.studysync.studysyncbackend.model.ModuleProgress.builder()
                        .user(currentUser)
                        .module(module)
                        .percentage(0)
                        .build());

        progress.setLastPosition(lastPosition);
        progress.setPercentage(Math.max(progress.getPercentage(), percentage)); // Only increase
        moduleProgressRepository.save(progress);

        // Update overall course progress
        updateOverallCourseProgress(currentUser.getId(), module.getCourse().getId());
    }

    private void updateOverallCourseProgress(Long userId, Long courseId) {
        List<com.studysync.studysyncbackend.model.Module> modules = moduleRepository.findByCourseId(courseId);
        List<com.studysync.studysyncbackend.model.ModuleProgress> progresses = moduleProgressRepository
                .findByUserIdAndModuleCourseId(userId, courseId);

        if (modules.isEmpty())
            return;

        int completedCount = (int) progresses.stream().filter(p -> p.isCompleted()).count();
        int overallPercentage = (completedCount * 100) / modules.size();

        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new EntityNotFoundException("Enrollment not found"));

        enrollment.setProgress(overallPercentage);
        if (overallPercentage == 100) {
            if (enrollment.getCompletedAt() == null) { // Only set once
                enrollment.setCompletedAt(java.time.LocalDateTime.now());
                Certificate cert = certificateService.generateCertificate(enrollment.getUser(), enrollment.getCourse());

                // Send Certificate Email
                try {
                    byte[] pdfBytes = certificateService.createPdf(cert);
                    emailService.sendCertificateEmail(enrollment.getUser().getEmail(),
                            enrollment.getUser().getFirstName(),
                            enrollment.getCourse().getTitle(),
                            pdfBytes);
                } catch (Exception e) {
                    System.err.println("Failed to send certificate email: " + e.getMessage());
                }
            }
        }
        enrollmentRepository.save(enrollment);
    }

    private EnrollmentResponseDto mapToDto(Enrollment enrollment) {
        return EnrollmentResponseDto.builder()
                .id(enrollment.getId())
                .userId(enrollment.getUser().getId())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .enrolledAt(enrollment.getEnrolledAt())
                .progress(enrollment.getProgress())
                .lastAccessed(enrollment.getLastAccessed())
                .course(courseService.mapCourseToDto(enrollment.getCourse())) // Map full course
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User)) {
            throw new IllegalStateException("User must be authenticated.");
        }
        return (User) authentication.getPrincipal();
    }
}
