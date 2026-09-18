package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional; // Import Optional

// JpaRepository<EntityType, PrimaryKeyType>
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    // Find all wishlist items for a specific user, ordered by when they were added
    List<WishlistItem> findByUserIdOrderByAddedAtDesc(Long userId);

    // Find a specific wishlist item by user and course
    Optional<WishlistItem> findByUserIdAndCourseId(Long userId, Long courseId);

    // Check if a specific course exists in a user's wishlist
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    // We can add more specific queries later if needed
}