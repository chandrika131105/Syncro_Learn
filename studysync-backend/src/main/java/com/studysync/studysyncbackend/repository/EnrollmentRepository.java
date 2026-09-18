package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    List<Enrollment> findByUserId(Long userId);

    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    long countByUserId(Long userId);

    void deleteByCourse(com.studysync.studysyncbackend.model.Course course);
}
