package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Size;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileUpdateDto {

    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @Size(max = 100, message = "Profession must not exceed 100 characters")
    private String profession;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;
}
