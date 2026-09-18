package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TutorLeaderboardEntryDto {
    private Long tutorId;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private long totalStudents;
    private int rank;
    private int courseCount;
}
