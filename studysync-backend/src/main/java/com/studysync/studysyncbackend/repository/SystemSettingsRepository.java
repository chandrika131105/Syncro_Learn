package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {
    Optional<SystemSettings> findByConfigKey(String configKey);
}
