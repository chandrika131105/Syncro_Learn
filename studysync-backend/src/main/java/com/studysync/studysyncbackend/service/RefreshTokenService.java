package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.model.RefreshToken;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.RefreshTokenRepository;
import com.studysync.studysyncbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Value("${application.security.jwt.refresh-token.expiration:604800000}") // Default 7 days
    private long refreshTokenDurationMs;

    public String createRefreshToken(Long userId, String ipAddress, String deviceInfo) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Limit allowed tokens per user to 5 active sessions
        java.util.List<RefreshToken> userTokens = refreshTokenRepository.findAllByUser(user);
        if (userTokens.size() >= 5) {
            userTokens.sort(java.util.Comparator.comparing(RefreshToken::getExpiryDate));
            refreshTokenRepository.delete(userTokens.get(0)); // Remove oldest token
        }

        // Generate a new UUID for the token string
        String rawToken = UUID.randomUUID().toString();
        String hashedToken = hashToken(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(hashedToken)
                .ipAddress(ipAddress)
                .deviceInfo(deviceInfo)
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .isRevoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return rawToken; // Return the raw token only to the user
    }

    public Optional<RefreshToken> findByToken(String token) {
        // Hash the incoming raw token before searching the DB
        return refreshTokenRepository.findByToken(hashToken(token));
    }

    private String hashToken(String token) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getEncoder().encodeToString(hash);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }

    public RefreshToken verifyToken(RefreshToken token, String ipAddress, String deviceInfo) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request.");
        }
        if (token.isRevoked()) {
            throw new RuntimeException("Refresh token was revoked. Please make a new signin request.");
        }

        // Optional: Device/IP binding check
        // Some systems explicitly block if IP changes, others just log or warn.
        // For strict hardening:
        if (token.getIpAddress() != null && !token.getIpAddress().equals(ipAddress)) {
            // In many mobile scenarios IP changes often, but for high security:
            // log.warn("IP mismatch for refresh token");
        }
        if (token.getDeviceInfo() != null && !token.getDeviceInfo().equals(deviceInfo)) {
            throw new RuntimeException("Device mismatch for refresh token. Security alert triggered.");
        }

        return token;
    }

    @Deprecated
    public RefreshToken verifyExpiration(RefreshToken token) {
        return verifyToken(token, null, null);
    }

    @Transactional
    public void revokeByUser(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            java.util.List<RefreshToken> tokens = refreshTokenRepository.findAllByUser(user);
            tokens.forEach(token -> token.setRevoked(true));
            refreshTokenRepository.saveAll(tokens);
        }
    }
}
