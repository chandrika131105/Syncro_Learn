package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.dto.CourseResponseDto;
import com.studysync.studysyncbackend.dto.WishlistItemResponseDto; // Import the response DTO
import com.studysync.studysyncbackend.model.WishlistItem;
import com.studysync.studysyncbackend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder; // For building URIs

import java.net.URI; // For URIs
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    /**
     * Endpoint to add a course to the current user's wishlist.
     * Returns 201 Created with the WishlistItemResponseDto.
     */
    @PostMapping("/{courseId}")
    public ResponseEntity<WishlistItemResponseDto> addItem(@PathVariable Long courseId) {
        WishlistItem createdItem = wishlistService.addItemToWishlist(courseId);
        // Map the created entity to the Response DTO using the service method
        WishlistItemResponseDto responseDto = wishlistService.mapWishlistItemToDto(createdItem);

        // Optionally build a location URI for the new wishlist item
        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/api/wishlist") // Or a more specific path if you add GET by ID
                .build() // Simplified URI for now
                .toUri();

        // Return 201 Created status with the DTO body
        return ResponseEntity.created(location).body(responseDto);
    }

    /**
     * Endpoint to retrieve the current user's wishlist as Course DTOs.
     */
    @GetMapping
    public ResponseEntity<List<CourseResponseDto>> getWishlist() {
        // Service already returns the correct DTO list
        List<CourseResponseDto> wishlist = wishlistService.getWishlistForCurrentUser();
        return ResponseEntity.ok(wishlist);
    }

    /**
     * Endpoint to remove a course from the current user's wishlist.
     * Returns 204 No Content on success.
     */
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long courseId) {
        wishlistService.removeItemFromWishlist(courseId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}