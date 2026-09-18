package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.model.SystemSettings;
import com.studysync.studysyncbackend.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SystemSettingsService {

    private final SystemSettingsRepository repository;
    private static final String DEFAULT_KEY = "DEFAULT";

    public SystemSettings getSettings() {
        return repository.findByConfigKey(DEFAULT_KEY)
                .orElseGet(() -> {
                    SystemSettings settings = SystemSettings.builder()
                            .configKey(DEFAULT_KEY)
                            .maintenanceMode(false)
                            .allowRegistrations(true)
                            .build();
                    return repository.save(settings);
                });
    }

    public SystemSettings updateSettings(SystemSettings newSettings) {
        SystemSettings current = getSettings();
        current.setMaintenanceMode(newSettings.isMaintenanceMode());
        current.setGlobalAnnouncement(newSettings.getGlobalAnnouncement());
        current.setAllowRegistrations(newSettings.isAllowRegistrations());
        return repository.save(current);
    }
}
