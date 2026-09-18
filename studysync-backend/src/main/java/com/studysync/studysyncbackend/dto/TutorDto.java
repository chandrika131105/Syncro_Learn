package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TutorDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email; // Include relevant public info
}