package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeaderboardEntryDto {
    private Long userId;
    private String firstName;
    private String lastName;
    private String avatarUrl; // If you have it
    private long points;
    private int rank;
    private int badgesCount;
}
