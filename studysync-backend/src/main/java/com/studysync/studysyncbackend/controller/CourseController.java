package com.studysync.studysyncbackend.controller;

// --- Imports ---
import com.studysync.studysyncbackend.dto.CourseComparisonDto;
import com.studysync.studysyncbackend.dto.CourseRequestDto;
import com.studysync.studysyncbackend.dto.CourseResponseDto;
import com.studysync.studysyncbackend.dto.ModuleRequestDto;
import com.studysync.studysyncbackend.dto.ModuleResponseDto; // Added import
import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.model.Module;
import com.studysync.studysyncbackend.service.CourseService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j; // Optional: for logging
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
// @Slf4j // Optional: Lombok annotation to add a logger
public class CourseController {

    private final CourseService courseService;

    /**
     * POST /api/courses : Creates a new course. (TUTOR only)
     */
    @PostMapping
    @PreAuthorize("hasAuthority('TUTOR')")
    public ResponseEntity<CourseResponseDto> createCourse(@Valid @RequestBody CourseRequestDto request) {
        Course newCourse = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .isPublished(request.isPublished())
                .thumbnail(request.getThumbnail())
                .category(request.getCategory())
                .level(request.getLevel())
                .build();
        Course createdCourse = courseService.createCourse(newCourse);
        CourseResponseDto responseDto = courseService.mapCourseToDto(createdCourse);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(createdCourse.getId()).toUri();
        return ResponseEntity.created(location).body(responseDto);
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<CourseResponseDto>> getRecommendations() {
        return ResponseEntity.ok(courseService.getRecommendations());
    }

    /**
     * GET /api/courses : Retrieves all available courses. (Authenticated users)
     */
    @GetMapping("/search")
    public ResponseEntity<org.springframework.data.domain.Page<CourseResponseDto>> searchCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean isFree,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity
                .ok(courseService.searchCourses(keyword, minPrice, maxPrice, isFree, sortBy, category, level,
                        pageable));
    }

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<CourseResponseDto>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Secure: Only return published courses for the public feed
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<CourseResponseDto> courses = courseService.findAllCourses(true, pageable);
        return ResponseEntity.ok(courses);
    }

    /**
     * GET /api/courses/my-courses : Retrieves courses created by the current tutor.
     */
    @GetMapping("/my-courses")
    @PreAuthorize("hasAuthority('TUTOR')")
    public ResponseEntity<org.springframework.data.domain.Page<CourseResponseDto>> getMyCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(courseService.findCoursesByTutor(pageable));
    }

    /**
     * POST /api/courses/{courseId}/modules : Adds a module to a specific course.
     * (TUTOR owner only)
     * Returns 201 Created with ModuleResponseDto.
     */
    @PostMapping("/{courseId}/modules")
    // @PreAuthorize("hasAuthority('TUTOR')") // Optional: Service layer already
    // checks ownership
    public ResponseEntity<ModuleResponseDto> addModule(
            @PathVariable Long courseId,
            @Valid @RequestBody ModuleRequestDto request) {
        // Service method now takes DTO
        Module createdModule = courseService.addModuleToCourse(courseId, request);
        // Map to response DTO
        ModuleResponseDto responseDto = courseService.mapModuleToDto(createdModule);

        // Build location URI for the new module
        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/api/courses/{courseId}/modules/{moduleId}")
                .buildAndExpand(courseId, createdModule.getId())
                .toUri();

        // Return 201 Created with location and DTO
        return ResponseEntity.created(location).body(responseDto);
    }

    /**
     * GET /api/courses/compare?ids=... : Retrieves comparison details for specified
     * courses. (Authenticated users)
     */
    @GetMapping("/compare")
    public ResponseEntity<List<CourseComparisonDto>> compareCourses(@RequestParam List<Long> ids) {
        if (ids == null || ids.size() < 2) {
            throw new IllegalArgumentException("Please provide at least two course IDs to compare.");
        }
        List<CourseComparisonDto> comparisonData = courseService.findCoursesForComparison(ids);
        if (comparisonData.isEmpty()) {
            throw new EntityNotFoundException("No courses found for the provided IDs.");
        }
        // Could add logic here to check if comparisonData.size() != ids.size() and
        // return partial content / warning
        return ResponseEntity.ok(comparisonData);
    }

    /**
     * PUT /api/courses/{courseId} : Updates an existing course. (TUTOR owner only)
     */
    @PutMapping("/{courseId}")
    // @PreAuthorize("hasAuthority('TUTOR')") // Optional: Service layer checks
    // ownership
    public ResponseEntity<CourseResponseDto> updateCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody CourseRequestDto request) {
        Course updatedCourse = courseService.updateCourse(courseId, request);
        CourseResponseDto responseDto = courseService.mapCourseToDto(updatedCourse);
        return ResponseEntity.ok(responseDto); // 200 OK with updated DTO
    }

    /**
     * DELETE /api/courses/{courseId} : Deletes a course. (TUTOR owner only)
     */
    @DeleteMapping("/{courseId}")
    // @PreAuthorize("hasAuthority('TUTOR')") // Optional: Service layer checks
    // ownership
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    /**
     * GET /api/courses/{id} : Retrieves specific course details including modules.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponseDto> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @DeleteMapping("/{courseId}/modules/{moduleId}")
    public ResponseEntity<Void> deleteModule(@PathVariable Long courseId, @PathVariable Long moduleId) {
        courseService.deleteModule(courseId, moduleId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{courseId}/modules/{moduleId}")
    public ResponseEntity<ModuleResponseDto> updateModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @Valid @RequestBody ModuleRequestDto request) {
        Module updatedModule = courseService.updateModule(courseId, moduleId, request);
        return ResponseEntity.ok(courseService.mapModuleToDto(updatedModule));
    }
}
