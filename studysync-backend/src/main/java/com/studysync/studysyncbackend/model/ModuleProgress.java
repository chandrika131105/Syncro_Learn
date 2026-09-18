package com.studysync.studysyncbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "module_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "module_id" })
})
public class ModuleProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    private double lastPosition; // In seconds

    private int percentage; // 0-100

    private boolean completed;

    private LocalDateTime lastAccessed;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastAccessed = LocalDateTime.now();
        if (percentage >= 95) {
            completed = true;
        }
    }
}
