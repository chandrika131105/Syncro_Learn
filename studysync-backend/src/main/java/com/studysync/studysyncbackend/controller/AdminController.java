package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.model.ApprovalStatus;
import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.model.Role;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.CourseRepository;
import com.studysync.studysyncbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final com.studysync.studysyncbackend.service.CourseService courseService;

    // --- User Management ---

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<User>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userRepository.findAll(pageable));
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Role newRole) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setRole(newRole);
                    userRepository.save(user);
                    return ResponseEntity.ok("User role updated to " + newRole);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestParam boolean banned) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setBanned(banned);
                    userRepository.save(user);
                    String status = banned ? "banned" : "unbanned";
                    return ResponseEntity.ok("User has been " + status);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- Course Moderation ---

    @GetMapping("/courses")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<Course>> getCourses(
            @RequestParam(required = false) ApprovalStatus status,
            Pageable pageable) {
        if (status != null) {
            return ResponseEntity.ok(courseRepository.findByApprovalStatus(status, pageable));
        }
        return ResponseEntity.ok(courseRepository.findAll(pageable));
    }

    @DeleteMapping("/courses/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/courses/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> approveCourse(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(course -> {
                    course.setApprovalStatus(ApprovalStatus.APPROVED);
                    // We don't force publish here; the tutor might want to keep it detailed draft
                    // until ready.
                    // But if it was published and pending, it remains published.
                    courseRepository.save(course);
                    return ResponseEntity.ok("Course approved");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/courses/{id}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> rejectCourse(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(course -> {
                    course.setApprovalStatus(ApprovalStatus.REJECTED);
                    course.setPublished(false); // Force unpublish if rejected
                    courseRepository.save(course);
                    return ResponseEntity.ok("Course rejected");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats/financials")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getFinancialStats() {
        java.math.BigDecimal totalRevenue = courseRepository.calculateTotalRevenue();
        if (totalRevenue == null)
            totalRevenue = java.math.BigDecimal.ZERO;

        java.math.BigDecimal platformFeePercentage = new java.math.BigDecimal("0.20");
        java.math.BigDecimal platformFees = totalRevenue.multiply(platformFeePercentage);
        java.math.BigDecimal payouts = totalRevenue.subtract(platformFees);

        java.util.List<Object[]> topTutorsRaw = courseRepository
                .findTopTutorsByRevenue(org.springframework.data.domain.PageRequest.of(0, 5));

        java.util.List<java.util.Map<String, Object>> topTutors = topTutorsRaw.stream().map(record -> {
            User tutor = (User) record[0];
            java.math.BigDecimal revenue = (java.math.BigDecimal) record[1];
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", tutor.getId());
            map.put("name", tutor.getFirstName() + " " + tutor.getLastName());
            map.put("email", tutor.getEmail());
            map.put("revenue", revenue);
            return map;
        }).toList();

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("totalRevenue", totalRevenue);
        response.put("platformFees", platformFees);
        response.put("payouts", payouts);
        response.put("topTutors", topTutors);

        return ResponseEntity.ok(response);
    }
}
