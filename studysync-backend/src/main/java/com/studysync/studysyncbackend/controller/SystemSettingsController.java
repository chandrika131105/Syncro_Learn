package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.model.SystemSettings;
import com.studysync.studysyncbackend.service.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system/settings")
@RequiredArgsConstructor
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;

    @GetMapping
    public ResponseEntity<SystemSettings> getSettings() {
        return ResponseEntity.ok(systemSettingsService.getSettings());
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<SystemSettings> updateSettings(@RequestBody SystemSettings newSettings) {
        return ResponseEntity.ok(systemSettingsService.updateSettings(newSettings));
    }
}
