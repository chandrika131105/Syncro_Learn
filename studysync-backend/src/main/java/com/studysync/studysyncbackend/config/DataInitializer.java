package com.studysync.studysyncbackend.config;

import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.model.Role;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.CourseRepository;
import com.studysync.studysyncbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
import java.util.Objects;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

        private final UserRepository userRepository;
        private final CourseRepository courseRepository;
        private final PasswordEncoder passwordEncoder;
        private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

        @Bean
        public CommandLineRunner initData() {
                return args -> {
                        // Schema update for role column skipped in H2 fallback mode

                        // Create or Update Admin/Tutor User
                        String adminEmail = "admin@studysync.com";
                        User admin = userRepository.findByEmail(adminEmail)
                                        .orElse(User.builder()
                                                        .email(adminEmail)
                                                        .points(0)
                                                        .currentStreak(0)
                                                        .build());

                        admin.setFirstName("Admin");
                        admin.setLastName("User");
                        admin.setPassword(passwordEncoder.encode("password")); // Reset password
                        admin.setRole(Role.ADMIN);

                        userRepository.save(Objects.requireNonNull(admin));
                        System.out.println("Admin user updated/created: " + adminEmail + " / password (Role: ADMIN)");

                        // Create or Update Standard User/Student
                        String userEmail = "user@studysync.com";
                        User user = userRepository.findByEmail(userEmail)
                                        .orElse(User.builder()
                                                        .email(userEmail)
                                                        .points(0)
                                                        .currentStreak(0)
                                                        .build());

                        user.setFirstName("Standard");
                        user.setLastName("User");
                        user.setPassword(passwordEncoder.encode("password")); // Reset password
                        user.setRole(Role.STUDENT);

                        userRepository.save(Objects.requireNonNull(user));
                        System.out.println("Standard user updated/created: " + userEmail + " / password");

                        // Create or Update Dedicated Tutor User
                        String tutorEmail = "tutor@studysync.com";
                        User tutor = userRepository.findByEmail(tutorEmail)
                                        .orElse(User.builder()
                                                        .email(tutorEmail)
                                                        .points(0)
                                                        .currentStreak(0)
                                                        .build());

                        tutor.setFirstName("Dedicated");
                        tutor.setLastName("Tutor");
                        tutor.setPassword(passwordEncoder.encode("password")); // Reset password
                        tutor.setRole(Role.TUTOR);

                        userRepository.save(Objects.requireNonNull(tutor));
                        System.out.println("Dedicated tutor updated/created: " + tutorEmail + " / password");

                        // Ensure Demo Course Exists and is Published
                        String demoTitle = "Introduction to StudySync";
                        Course demoCourse = courseRepository.findAll().stream()
                                        .filter(c -> c.getTitle().equals(demoTitle))
                                        .findFirst()
                                        .orElse(Course.builder()
                                                        .title(demoTitle)
                                                        .description(
                                                                        "A sample course demonstrates the capabilities of the StudySync platform. Learn how to create, manage, and publish courses.")
                                                        .price(new BigDecimal("19.99"))
                                                        .category("Development")
                                                        .level("Beginner")
                                                        .thumbnail("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1280&q=80")
                                                        .tutor(admin)
                                                        .build());

                        demoCourse.setPublished(true); // Force publish
                        demoCourse.setApprovalStatus(com.studysync.studysyncbackend.model.ApprovalStatus.APPROVED);
                        courseRepository.save(demoCourse);
                        System.out.println("Ensured demo course is published: " + demoTitle);
                };
        }
}
