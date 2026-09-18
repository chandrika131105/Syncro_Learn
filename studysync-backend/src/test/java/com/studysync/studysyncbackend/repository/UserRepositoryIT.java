package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import java.util.Objects;

@SpringBootTest
@Testcontainers
class UserRepositoryIT {

    @Container
    @SuppressWarnings("resource")
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.35")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private UserRepository userRepository;

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Test
    void saveAndFindUser() {
        User user = User.builder().email("it@example.com").password("pw").firstName("IT").build();
        User saved = userRepository.save(Objects.requireNonNull(user));
        assertThat(saved.getId()).isNotNull();

        var found = userRepository.findById(Objects.requireNonNull(saved.getId()));
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("it@example.com");
    }
}
