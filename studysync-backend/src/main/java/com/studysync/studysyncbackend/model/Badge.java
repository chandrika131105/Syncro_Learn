package com.studysync.studysyncbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50) // e.g., "COURSE_FINISHER"
    private String badgeCode;

    @Column(nullable = false, length = 100) // e.g., "Course Finisher"
    private String name;

    @Column(length = 255) // e.g., "Awarded for completing your first course."
    private String description;

    @Column(length = 255) // URL to an icon image, if desired
    private String iconUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 10) // Null means available to ALL roles
    private Role targetRole;

    // Add criteria fields later if needed (e.g., points required, specific action
    // count)
}
