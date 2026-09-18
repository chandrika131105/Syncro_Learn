package com.studysync.studysyncbackend.component;

import com.studysync.studysyncbackend.model.Badge;
import com.studysync.studysyncbackend.model.Role;
import com.studysync.studysyncbackend.repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BadgeInitializer implements CommandLineRunner {

    private final BadgeRepository badgeRepository;

    @Override
    public void run(String... args) {
        if (badgeRepository.count() == 0) {
            log.info("Initializing default badges...");

            List<Badge> defaultBadges = List.of(
                    Badge.builder()
                            .badgeCode("QUIZ_MASTER")
                            .name("Quiz Master")
                            .description("Awarded for getting 100% on any quiz.")
                            .targetRole(Role.STUDENT)
                            .build(),
                    Badge.builder()
                            .badgeCode("FIRST_STEPS")
                            .name("First Steps")
                            .description("Awarded for enrolling in your first course.")
                            .targetRole(Role.STUDENT)
                            .build(),
                    Badge.builder()
                            .badgeCode("TOP_CONTRIBUTOR")
                            .name("Top Contributor")
                            .description("Awarded for active participation in discussions.")
                            .targetRole(null)
                            .build(),
                    Badge.builder()
                            .badgeCode("ELITE_INSTRUCTOR")
                            .name("Elite Instructor")
                            .description("Awarded for publishing your first 5 courses.")
                            .targetRole(Role.TUTOR)
                            .build());

            badgeRepository.saveAll(java.util.Objects.requireNonNull(defaultBadges));
            log.info("Successfully initialized {} badges.", defaultBadges.size());
        }
    }
}
