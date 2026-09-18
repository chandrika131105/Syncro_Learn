package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.ModuleProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleProgressRepository extends JpaRepository<ModuleProgress, Long> {
    Optional<ModuleProgress> findByUserIdAndModuleId(Long userId, Long moduleId);

    List<ModuleProgress> findByUserIdAndModuleCourseId(Long userId, Long courseId);
}
