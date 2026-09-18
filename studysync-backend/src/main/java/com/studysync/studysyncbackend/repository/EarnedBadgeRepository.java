package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.EarnedBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// Repository for EarnedBadge records (linking users and badges)
public interface EarnedBadgeRepository extends JpaRepository<EarnedBadge, Long> {

    // Find all badges earned by a specific user
    List<EarnedBadge> findByUserIdOrderByEarnedAtDesc(Long userId);

    // Check if a user has already earned a specific badge (by badge code)
    boolean existsByUser_IdAndBadge_BadgeCode(Long userId, String badgeCode);

    // Count badges for a user
    int countByUserId(Long userId);

    // Find a specific earned badge record
    // Optional<EarnedBadge> findByUser_IdAndBadge_BadgeCode(Long userId, String
    // badgeCode); // If needed later
}
