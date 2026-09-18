package com.studysync.studysyncbackend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "courses")
@EqualsAndHashCode(exclude = { "modules" })
@ToString(exclude = { "modules" })
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "average_rating")
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = false;

    // Helper to avoid nulls in logic
    public boolean isPublished() {
        return Boolean.TRUE.equals(isPublished);
    }

    public void setPublished(boolean published) {
        this.isPublished = published;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    private String category;

    private String level; // Beginner, Intermediate, Advanced

    @Column(length = 2048)
    private String thumbnail;

    // --- Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonManagedReference
    private List<Module> modules = new ArrayList<>();

    public void addModule(Module module) {
        modules.add(module);
        module.setCourse(this);
    }

    public void removeModule(Module module) {
        modules.remove(module);
        module.setCourse(null);
    }
}