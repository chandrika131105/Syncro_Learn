package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByUserIdAndCourseId(Long userId, Long courseId);

    Optional<Certificate> findByVerificationCode(String verificationCode);

    List<Certificate> findByUserId(Long userId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
}
