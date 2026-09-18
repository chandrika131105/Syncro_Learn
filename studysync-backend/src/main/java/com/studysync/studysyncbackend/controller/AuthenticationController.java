package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.dto.AuthenticationRequest;
import com.studysync.studysyncbackend.dto.AuthenticationResponse;
import com.studysync.studysyncbackend.dto.RegisterRequest;
import com.studysync.studysyncbackend.dto.TokenRefreshRequest;
import com.studysync.studysyncbackend.model.RefreshToken;
import com.studysync.studysyncbackend.service.JwtService;
import com.studysync.studysyncbackend.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;

import java.time.Duration;

import com.studysync.studysyncbackend.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // Marks this class as a REST controller
@RequestMapping("/api/auth") // Base path for all endpoints in this controller
@RequiredArgsConstructor // Lombok creates constructor with final fields
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    // Rate limiter: 5 requests per minute
    private final Bucket bucket = Bucket.builder()
            .addLimit(Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1))))
            .build();

    /**
     * Endpoint for user registration.
     * Accepts registration details in the request body.
     *
     * @param request The RegisterRequest DTO containing user details.
     * @return ResponseEntity containing the AuthenticationResponse (JWT token).
     */
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = getIpAddress(servletRequest);
        String deviceInfo = getDeviceInfo(servletRequest);
        // Call the register method in AuthenticationService
        AuthenticationResponse response = authenticationService.register(request, ipAddress, deviceInfo);
        // Return the response with HTTP status OK (200)
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint for user authentication (login).
     * Accepts login credentials in the request body.
     *
     * @param request The AuthenticationRequest DTO containing email and password.
     * @return ResponseEntity containing the AuthenticationResponse (JWT token).
     */
    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(
            @Valid @RequestBody AuthenticationRequest request,
            HttpServletRequest servletRequest) {

        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(429).body("Too many login attempts. Try again later.");
        }

        String ipAddress = getIpAddress(servletRequest);
        String deviceInfo = getDeviceInfo(servletRequest);

        // Call the authenticate method in AuthenticationService
        AuthenticationResponse response = authenticationService.authenticate(request, ipAddress, deviceInfo);
        // Return the response with HTTP status OK (200)
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request, HttpServletRequest servletRequest) {
        String requestRefreshToken = request.getRefreshToken();
        String ipAddress = getIpAddress(servletRequest);
        String deviceInfo = getDeviceInfo(servletRequest);

        java.util.Optional<RefreshToken> tokenOpt = refreshTokenService.findByToken(requestRefreshToken);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(403).body("Refresh token is not in database!");
        }

        RefreshToken refreshToken = tokenOpt.get();
        refreshTokenService.verifyToken(refreshToken, ipAddress, deviceInfo);
        com.studysync.studysyncbackend.model.User user = refreshToken.getUser();

        String token = jwtService.generateToken(user);
        // Rotate refresh token
        refreshTokenService.revokeByUser(user.getId());
        String newRefreshToken = refreshTokenService.createRefreshToken(user.getId(), ipAddress, deviceInfo);

        return ResponseEntity.ok(AuthenticationResponse.builder()
                .token(token)
                .refreshToken(newRefreshToken)
                .id(user.getId())
                .username(user.getEmail())
                .role(user.getRole().name())
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(org.springframework.security.core.Authentication authentication) {
        if (authentication != null
                && authentication.getPrincipal() instanceof com.studysync.studysyncbackend.model.User) {
            com.studysync.studysyncbackend.model.User user = (com.studysync.studysyncbackend.model.User) authentication
                    .getPrincipal();
            // Revoke all existing refresh tokens for this user on logout
            refreshTokenService.revokeByUser(user.getId());
        }
        return ResponseEntity.ok("Logged out successfully");
    }

    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    private String getDeviceInfo(HttpServletRequest request) {
        // Simple User-Agent as device info for now
        return request.getHeader("User-Agent");
    }
}