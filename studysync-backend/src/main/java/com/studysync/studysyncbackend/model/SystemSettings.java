package com.studysync.studysyncbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "system_settings")
public class SystemSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Singleton pattern enforcement key, e.g., "DEFAULT"
    @Column(unique = true, nullable = false)
    private String configKey;

    private boolean maintenanceMode;

    private String globalAnnouncement; // Null if no announcement

    private boolean allowRegistrations; // Example: Turn off signups
}
