package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.model.UserActivity;
import com.studysync.studysyncbackend.repository.UserActivityRepository;
import com.studysync.studysyncbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserActivityService {

    private final UserActivityRepository activityRepository;
    private final UserRepository userRepository;

    @Transactional
    public void logActivity(Long userId) {
        LocalDate today = LocalDate.now();

        // 1. Log Activity Count
        UserActivity activity = activityRepository.findByUserIdAndActivityDate(userId, today)
                .orElse(UserActivity.builder()
                        .user(userRepository.getReferenceById(Objects.requireNonNull(userId)))
                        .activityDate(today)
                        .count(0)
                        .build());
        if (activity.getId() == null) {
            // ensure User is set correctly if using reference
        }

        activity.setCount(activity.getCount() + 1);
        activityRepository.save(activity);

        // 2. Update Streak
        User user = userRepository.findById(Objects.requireNonNull(userId)).orElseThrow();
        LocalDate lastLogin = user.getLastLoginDate();

        if (lastLogin == null) {
            user.setCurrentStreak(1);
        } else if (lastLogin.equals(today.minusDays(1))) {
            // Consecutive day
            user.setCurrentStreak(user.getCurrentStreak() + 1);
        } else if (lastLogin.isBefore(today.minusDays(1))) {
            // Broken streak
            user.setCurrentStreak(1);
        }
        // If lastLogin equals today, do nothing to streak

        user.setLastLoginDate(today);
        userRepository.save(user);
    }
}
