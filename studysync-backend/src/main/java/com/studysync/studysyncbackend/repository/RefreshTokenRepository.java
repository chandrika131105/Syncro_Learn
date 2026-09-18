package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.RefreshToken;
import com.studysync.studysyncbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUser(User user);

    java.util.List<RefreshToken> findAllByUser(User user);

    void deleteByUser(User user);
}
