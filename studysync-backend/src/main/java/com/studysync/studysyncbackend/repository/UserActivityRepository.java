package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    Optional<UserActivity> findByUserIdAndActivityDate(Long userId, LocalDate activityDate);

    List<UserActivity> findByUserId(Long userId);
}
