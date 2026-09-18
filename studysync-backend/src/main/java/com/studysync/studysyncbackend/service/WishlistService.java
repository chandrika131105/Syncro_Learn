package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.CourseResponseDto;
import com.studysync.studysyncbackend.dto.WishlistItemResponseDto; // Import the response DTO
import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.model.WishlistItem;
import com.studysync.studysyncbackend.repository.CourseRepository;
import com.studysync.studysyncbackend.repository.WishlistItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final CourseRepository courseRepository;
    private final CourseService courseService; // To reuse course mapping

    /**
     * Adds a course to the currently authenticated user's wishlist.
     *
     * @param courseId The ID of the course to add.
     * @return The created WishlistItem entity (before mapping to DTO).
     * @throws EntityNotFoundException if the course doesn't exist.
     * @throws IllegalStateException   if the item is already in the wishlist.
     */
    @Transactional
    public WishlistItem addItemToWishlist(Long courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(Objects.requireNonNull(courseId))
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));

        if (wishlistItemRepository.existsByUserIdAndCourseId(currentUser.getId(), courseId)) {
            throw new IllegalStateException("Course already exists in the wishlist.");
        }

        WishlistItem wishlistItem = WishlistItem.builder()
                .user(currentUser)
                .course(course)
                .build();

        return wishlistItemRepository.save(Objects.requireNonNull(wishlistItem));
    }

    /**
     * Removes a course from the currently authenticated user's wishlist.
     *
     * @param courseId The ID of the course to remove.
     * @throws EntityNotFoundException if the item is not found in the wishlist.
     */
    @Transactional
    public void removeItemFromWishlist(Long courseId) {
        User currentUser = getCurrentUser();
        WishlistItem wishlistItem = wishlistItemRepository.findByUserIdAndCourseId(currentUser.getId(), courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found in wishlist for user with ID: "
                        + currentUser.getId() + " and Course ID: " + courseId));

        wishlistItemRepository.delete(Objects.requireNonNull(wishlistItem));
    }

    /**
     * Retrieves the wishlist for the currently authenticated user as Course DTOs.
     *
     * @return List of CourseResponseDto representing the wishlist items.
     */
    @Transactional(readOnly = true)
    public List<CourseResponseDto> getWishlistForCurrentUser() {
        User currentUser = getCurrentUser();
        List<WishlistItem> items = wishlistItemRepository.findByUserIdOrderByAddedAtDesc(currentUser.getId());

        return items.stream()
                .map(item -> courseService.mapCourseToDto(item.getCourse())) // Reuse course mapping
                .collect(Collectors.toList());
    }

    /**
     * Helper method to map a WishlistItem entity to a WishlistItemResponseDto.
     * This needs to be public if called directly from the controller.
     * Transactional context ensures lazy-loaded fields can be accessed.
     */
    @Transactional(readOnly = true)
    public WishlistItemResponseDto mapWishlistItemToDto(WishlistItem item) {
        // Get the course associated with the wishlist item
        Course course = item.getCourse();

        // Use the CourseService's mapping method.
        // Lazy loading of the tutor will happen inside mapCourseToDto
        // within the active transaction.
        CourseResponseDto courseDto = courseService.mapCourseToDto(course);

        return WishlistItemResponseDto.builder()
                .id(item.getId())
                .course(courseDto)
                .addedAt(item.getAddedAt())
                .build();
    }

    // Helper method to get the currently authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User)) {
            throw new IllegalStateException("User must be authenticated.");
        }
        return (User) authentication.getPrincipal();
    }
}