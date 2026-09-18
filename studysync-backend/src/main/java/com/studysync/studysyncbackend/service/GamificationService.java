package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.model.Badge;
import com.studysync.studysyncbackend.model.EarnedBadge;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.BadgeRepository;
import com.studysync.studysyncbackend.repository.EarnedBadgeRepository;
import com.studysync.studysyncbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Import Slf4j for logging
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j // Lombok annotation for easy logging (adds a 'log' object)
public class GamificationService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final EarnedBadgeRepository earnedBadgeRepository;

    /**
     * Adds the specified number of points to a user.
     *
     * @param userId      The ID of the user to award points to.
     * @param pointsToAdd The number of points to add (can be negative).
     */
    @Transactional
    public void addPoints(Long userId, long pointsToAdd) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        user.setPoints(user.getPoints() + pointsToAdd);
        userRepository.save(user); // Save the updated user
        log.info("Awarded {} points to user ID {}. Total points: {}", pointsToAdd, userId, user.getPoints());
    }

    /**
     * Awards a specific badge to a user if they haven't earned it already.
     *
     * @param userId    The ID of the user to award the badge to.
     * @param badgeCode The unique code of the badge to award (e.g.,
     *                  "COURSE_FINISHER").
     */
    @Transactional
    public void awardBadge(Long userId, String badgeCode) {
        awardBadgeIfNotExists(userId, badgeCode);
    }

    /**
     * Awards a specific badge to a user if they haven't earned it already.
     * Returns true if the badge was newly awarded, false otherwise.
     *
     * @param userId    The ID of the user to award the badge to.
     * @param badgeCode The unique code of the badge to award.
     * @return true if awarded now, false if already possessed.
     */
    @Transactional
    public boolean awardBadgeIfNotExists(Long userId, String badgeCode) {
        // Check if user already has the badge
        if (earnedBadgeRepository.existsByUser_IdAndBadge_BadgeCode(userId, badgeCode)) {
            log.debug("User ID {} already has badge {}", userId, badgeCode);
            return false; // Already earned, do nothing
        }

        // Find the user and badge definitions
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        Badge badge = badgeRepository.findByBadgeCode(badgeCode)
                .orElseThrow(() -> new EntityNotFoundException("Badge not found with code: " + badgeCode));

        try {
            // Create the EarnedBadge record
            EarnedBadge earnedBadge = EarnedBadge.builder()
                    .user(user)
                    .badge(badge)
                    .build();

            earnedBadgeRepository.save(Objects.requireNonNull(earnedBadge));
            log.info("Awarded badge '{}' ({}) to user ID {}", badge.getName(), badgeCode, userId);
            return true;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // This handles the race condition where another thread saved it between our
            // check and save
            log.info("User ID {} already has badge {} (handled via race condition)", userId, badgeCode);
            return false;
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<com.studysync.studysyncbackend.dto.LeaderboardEntryDto> getGlobalLeaderboard() {
        java.util.List<User> topUsers = userRepository.findTop10ByOrderByPointsDesc();

        java.util.List<com.studysync.studysyncbackend.dto.LeaderboardEntryDto> leaderboard = new java.util.ArrayList<>();
        int rank = 1;
        for (User u : topUsers) {
            leaderboard.add(com.studysync.studysyncbackend.dto.LeaderboardEntryDto.builder()
                    .userId(u.getId())
                    .firstName(u.getFirstName())
                    .lastName(u.getLastName())
                    .points(u.getPoints())
                    .rank(rank++)
                    .badgesCount(earnedBadgeRepository.countByUserId(u.getId()))
                    .build());
        }
        return leaderboard;
    }

    @Transactional(readOnly = true)
    public java.util.List<com.studysync.studysyncbackend.dto.TutorLeaderboardEntryDto> getTutorLeaderboard() {
        java.util.List<Object[]> results = userRepository.findTopTutorsByEnrollments();
        java.util.List<com.studysync.studysyncbackend.dto.TutorLeaderboardEntryDto> leaderboard = new java.util.ArrayList<>();

        int rank = 1;
        for (Object[] row : results) {
            if (row.length < 2)
                continue;
            User u = (User) row[0];
            Long count = (Long) row[1];

            // Limit to top 10 safely
            if (rank > 10)
                break;

            leaderboard.add(com.studysync.studysyncbackend.dto.TutorLeaderboardEntryDto.builder()
                    .tutorId(u.getId())
                    .firstName(u.getFirstName())
                    .lastName(u.getLastName())
                    .totalStudents(count)
                    .rank(rank++)
                    .courseCount(0) // Could be added to query if needed, or left as 0 for MVP
                    .build());
        }
        return leaderboard;
    }

}
