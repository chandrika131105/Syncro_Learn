package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.AuthenticationRequest;
import com.studysync.studysyncbackend.dto.AuthenticationResponse;
import com.studysync.studysyncbackend.dto.RegisterRequest;
import com.studysync.studysyncbackend.model.Role;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final UserActivityService userActivityService;
        private final RefreshTokenService refreshTokenService;

        public AuthenticationResponse register(RegisterRequest request, String ipAddress, String deviceInfo) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new IllegalStateException("Email already in use");
                }

                var user = User.builder()
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole() != null ? request.getRole() : Role.STUDENT)
                                .build();

                userRepository.save(Objects.requireNonNull(user));
                userActivityService.logActivity(user.getId()); // Log initial activity

                var jwtToken = jwtService.generateToken(user);

                // Retrieve/Create Refresh Token
                refreshTokenService.revokeByUser(user.getId());
                var refreshToken = refreshTokenService.createRefreshToken(user.getId(), ipAddress, deviceInfo);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .refreshToken(refreshToken)
                                .id(user.getId())
                                .username(user.getEmail())
                                .role(user.getRole().name())
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request, String ipAddress, String deviceInfo) {
                try {
                        authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        request.getEmail(),
                                                        request.getPassword()));
                } catch (org.springframework.security.core.AuthenticationException e) {
                        log.warn("Failed login attempt for user: {}", request.getEmail());
                        throw e; // Re-throw to be handled by Spring Security
                }

                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found after authentication"));

                userActivityService.logActivity(user.getId()); // Log daily login

                var jwtToken = jwtService.generateToken(user);

                // Retrieve/Create Refresh Token
                refreshTokenService.revokeByUser(user.getId());
                var refreshToken = refreshTokenService.createRefreshToken(user.getId(), ipAddress, deviceInfo);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .refreshToken(refreshToken)
                                .id(user.getId())
                                .username(user.getEmail())
                                .role(user.getRole().name())
                                .build();
        }
}