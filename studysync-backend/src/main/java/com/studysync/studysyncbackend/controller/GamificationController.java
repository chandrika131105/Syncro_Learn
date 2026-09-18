package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.model.EarnedBadge;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.EarnedBadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final com.studysync.studysyncbackend.service.GamificationService gamificationService;
    private final EarnedBadgeRepository earnedBadgeRepository;

    @GetMapping("/leaderboard")
    public ResponseEntity<List<com.studysync.studysyncbackend.dto.LeaderboardEntryDto>> getLeaderboard() {
        return ResponseEntity.ok(gamificationService.getGlobalLeaderboard());
    }

    @GetMapping("/tutor-leaderboard")
    public ResponseEntity<List<com.studysync.studysyncbackend.dto.TutorLeaderboardEntryDto>> getTutorLeaderboard() {
        return ResponseEntity.ok(gamificationService.getTutorLeaderboard());
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getGamificationProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        List<EarnedBadge> badges = earnedBadgeRepository.findByUserIdOrderByEarnedAtDesc(user.getId());

        Map<String, Object> profile = new HashMap<>();
        profile.put("points", user.getPoints());
        profile.put("currentStreak", user.getCurrentStreak());
        profile.put("badges", badges.stream().map(eb -> {
            Map<String, Object> b = new HashMap<>();
            b.put("code", eb.getBadge().getBadgeCode());
            b.put("name", eb.getBadge().getName());
            b.put("description", eb.getBadge().getDescription());
            b.put("earnedAt", eb.getEarnedAt());
            return b;
        }).collect(Collectors.toList()));

        return ResponseEntity.ok(profile);
    }
}
