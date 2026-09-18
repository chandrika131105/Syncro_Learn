package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.ApprovalStatus;
import com.studysync.studysyncbackend.model.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {
    Page<Course> findByTutorId(Long tutorId, Pageable pageable);

    Page<Course> findByIsPublished(boolean isPublished, Pageable pageable);

    Page<Course> findByIsPublishedTrueAndApprovalStatus(ApprovalStatus approvalStatus, Pageable pageable);

    Page<Course> findByApprovalStatus(ApprovalStatus approvalStatus, Pageable pageable);

    // Recommendation Queries
    List<Course> findTop5ByIsPublishedTrueAndApprovalStatusOrderByViewCountDesc(ApprovalStatus approvalStatus);

    List<Course> findTop5ByIsPublishedTrueAndApprovalStatusOrderByAverageRatingDesc(ApprovalStatus approvalStatus);

    List<Course> findTop10ByIsPublishedTrueAndApprovalStatusAndCategoryIn(ApprovalStatus approvalStatus,
            List<String> categories, Pageable pageable);

    // Financial Analysis
    @org.springframework.data.jpa.repository.Query("SELECT SUM(c.price) FROM Enrollment e JOIN e.course c")
    java.math.BigDecimal calculateTotalRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT c.tutor, SUM(c.price) as revenue FROM Enrollment e JOIN e.course c GROUP BY c.tutor ORDER BY revenue DESC")
    List<Object[]> findTopTutorsByRevenue(Pageable pageable);
}