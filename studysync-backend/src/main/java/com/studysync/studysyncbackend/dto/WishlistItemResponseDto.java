package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WishlistItemResponseDto {
    private Long id; // Wishlist item ID
    private CourseResponseDto course; // Include the course DTO
    private LocalDateTime addedAt;
    // We don't need to include the full User object here
}