package com.studysync.studysyncbackend.model;

import com.fasterxml.jackson.annotation.JsonBackReference; // Import this
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode; // Import for EqualsAndHashCode
import lombok.ToString; // Import for ToString

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "modules")
@EqualsAndHashCode(exclude = { "course" })
@ToString(exclude = { "course" })

public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content; // For text-based notes

    @Column(length = 512) // Store URL for uploaded video
    private String videoUrl;

    @Column(length = 512) // Store URL for uploaded notes (PDF, etc.)
    private String notesUrl;

    @OneToOne(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonBackReference
    private Course course;

}