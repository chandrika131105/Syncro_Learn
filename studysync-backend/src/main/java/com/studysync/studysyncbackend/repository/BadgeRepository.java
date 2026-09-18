    package com.studysync.studysyncbackend.repository;

    import com.studysync.studysyncbackend.model.Badge;
    import org.springframework.data.jpa.repository.JpaRepository;

    import java.util.Optional; // Import Optional

    // Repository for Badge definitions
    public interface BadgeRepository extends JpaRepository<Badge, Long> {

        // Find a badge definition by its unique code
        Optional<Badge> findByBadgeCode(String badgeCode);

        // Check if a badge definition exists by its code
        boolean existsByBadgeCode(String badgeCode);
    }
    
