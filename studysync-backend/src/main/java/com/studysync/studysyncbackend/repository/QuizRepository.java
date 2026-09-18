package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByModuleId(Long moduleId);
}
