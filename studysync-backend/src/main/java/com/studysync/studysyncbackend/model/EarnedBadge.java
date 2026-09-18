package com.studysync.studysyncbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "earned_badges",
    // Prevent a user from earning the exact same badge multiple times
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "badge_id"})
)
public class EarnedBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE) // If user is deleted, remove their earned badges
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", nullable = false)
    // Optional: @OnDelete(action = OnDeleteAction.CASCADE) // If badge definition is deleted, remove earned records? Or restrict delete?
    private Badge badge;

    @Column(nullable = false, updatable = false)
    private LocalDateTime earnedAt;

    @PrePersist
    protected void onCreate() {
        earnedAt = LocalDateTime.now();
    }
}
