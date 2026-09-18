package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;

// JpaRepository<EntityType, PrimaryKeyType>
public interface ModuleRepository extends JpaRepository<Module, Long> {

    // You can add custom query methods here later if needed
    // For example, to find all modules for a specific course:
    java.util.List<Module> findByCourseId(Long courseId);

}