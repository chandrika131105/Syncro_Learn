package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.UserRepository;
import com.studysync.studysyncbackend.service.FileStorageService;
import com.studysync.studysyncbackend.repository.UserActivityRepository;
import com.studysync.studysyncbackend.model.UserActivity;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.studysync.studysyncbackend.dto.UserProfileUpdateDto; // Added DTO import
import jakarta.validation.Valid; // Added validation import
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final UserActivityRepository userActivityRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/activity")
    public ResponseEntity<List<UserActivity>> getUserActivity(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(userActivityRepository.findByUserId(user.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserProfileUpdateDto updatedData) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updatedData.getFirstName() != null)
            user.setFirstName(updatedData.getFirstName());
        if (updatedData.getLastName() != null)
            user.setLastName(updatedData.getLastName());
        if (updatedData.getProfession() != null)
            user.setProfession(updatedData.getProfession());
        if (updatedData.getBio() != null)
            user.setBio(updatedData.getBio());

        User savedUser = userRepository.save(Objects.requireNonNull(user));
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String fileName = fileStorageService.storeFile(file);

        // Assuming FileController exposes /api/files/download/{fileName}
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/download/")
                .path(Objects.requireNonNull(fileName))
                .toUriString();

        user.setAvatarUrl(fileDownloadUri);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("avatarUrl", fileDownloadUri);
        return ResponseEntity.ok(response);
    }
}
