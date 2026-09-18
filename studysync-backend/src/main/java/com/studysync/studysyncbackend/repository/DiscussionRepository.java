package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.Discussion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiscussionRepository extends JpaRepository<Discussion, Long> {
    // Find top-level discussions for a module (ordered by newest) - Returns ALL
    // (for Admin)
    List<Discussion> findByModuleIdAndParentIsNullOrderByCreatedAtDesc(Long moduleId);

    // Find top-level discussions for a module (ordered by newest) - Returns only
    // visible
    List<Discussion> findByModuleIdAndParentIsNullAndIsHiddenFalseOrderByCreatedAtDesc(Long moduleId);

    // Find top-level discussions for a course (ordered by newest)
    List<Discussion> findByCourseIdAndParentIsNullOrderByCreatedAtDesc(Long courseId);

    // Find ALL discussions (for Admin moderation)
    org.springframework.data.domain.Page<Discussion> findAllByOrderByCreatedAtDesc(
            org.springframework.data.domain.Pageable pageable);
}
