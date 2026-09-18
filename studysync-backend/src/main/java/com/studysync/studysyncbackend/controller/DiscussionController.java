package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.model.Discussion;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.DiscussionRepository;
import com.studysync.studysyncbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/discussions")
@RequiredArgsConstructor
public class DiscussionController {

        private final DiscussionRepository discussionRepository;
        private final UserRepository userRepository;
        private final com.studysync.studysyncbackend.repository.ModuleRepository moduleRepository;
        private final com.studysync.studysyncbackend.repository.EnrollmentRepository enrollmentRepository;
        private final com.studysync.studysyncbackend.service.EmailService emailService;

        @GetMapping("/module/{moduleId}")
        public ResponseEntity<List<Discussion>> getModuleDiscussions(
                        @PathVariable Long moduleId,
                        @AuthenticationPrincipal UserDetails userDetails) {

                boolean isAdmin = userDetails != null && userDetails.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ADMIN"));

                if (isAdmin) {
                        return ResponseEntity.ok(
                                        discussionRepository
                                                        .findByModuleIdAndParentIsNullOrderByCreatedAtDesc(moduleId));
                } else {
                        return ResponseEntity.ok(
                                        discussionRepository
                                                        .findByModuleIdAndParentIsNullAndIsHiddenFalseOrderByCreatedAtDesc(
                                                                        moduleId));
                }
        }

        @PutMapping("/{id}/hide")
        @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ADMIN')")
        public ResponseEntity<?> toggleHideDiscussion(@PathVariable Long id, @RequestParam boolean hidden) {
                return discussionRepository.findById(id)
                                .map(discussion -> {
                                        discussion.setHidden(hidden);
                                        discussionRepository.save(discussion);
                                        return ResponseEntity.ok("Discussion visibility updated.");
                                })
                                .orElse(ResponseEntity.notFound().build());
        }

        @PostMapping
        public ResponseEntity<Discussion> createDiscussion(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestBody Discussion request) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Validate Module and Access
                com.studysync.studysyncbackend.model.Module module = moduleRepository
                                .findById(Objects.requireNonNull(request.getModuleId()))
                                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Module not found"));

                if (module.getCourse() == null) {
                        throw new jakarta.persistence.EntityNotFoundException("Course not found for this module.");
                }

                Long courseId = module.getCourse().getId();
                boolean isOwner = module.getCourse().getTutor().getId().equals(user.getId());
                boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId);

                if (!isOwner && !isEnrolled) {
                        throw new org.springframework.security.access.AccessDeniedException(
                                        "You must be enrolled to post in this discussion.");
                }

                request.setUser(user);
                request.setCourseId(courseId); // Ensure consistency
                return ResponseEntity.ok(discussionRepository.save(request));
        }

        @GetMapping("/admin/all")
        @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ADMIN')")
        public ResponseEntity<?> getAllDiscussions(org.springframework.data.domain.Pageable pageable) {
                return ResponseEntity.ok(discussionRepository.findAllByOrderByCreatedAtDesc(pageable));
        }

        @PostMapping("/{id}/reply")
        public ResponseEntity<Discussion> replyToDiscussion(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable Long id,
                        @RequestBody Discussion replyRequest) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Discussion parent = discussionRepository.findById(Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Discussion not found"));

                Long courseId = parent.getCourseId();
                // We assume fetching the course is safe via repository if needed, but
                // discussion has courseId.
                // To be strictly safe, we should check if user can access that courseId.
                // For optimization, we trust the parent's courseId, but valid access check
                // requires querying course owner or enrollment.
                boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId);
                // Note: Checking owner is harder here without fetching Course entity.
                // For now, we assume if enrolled, it's okay. If Tutor replies, they should be
                // enrolled?
                // Or we fetch course. Let's be robust.
                boolean isOwner = false;
                // Optimization: Lazy check. If enrolled, pass. If not, fetch course to check
                // owner.
                if (!isEnrolled) {
                        com.studysync.studysyncbackend.model.Course c = moduleRepository
                                        .findById(Objects.requireNonNull(parent.getModuleId()))
                                        .get().getCourse();
                        if (c.getTutor().getId().equals(user.getId())) {
                                isOwner = true;
                        }
                }

                if (!isOwner && !isEnrolled) {
                        throw new org.springframework.security.access.AccessDeniedException(
                                        "You must be enrolled to reply.");
                }

                replyRequest.setUser(user);
                replyRequest.setParent(parent);
                replyRequest.setCourseId(parent.getCourseId());
                replyRequest.setModuleId(parent.getModuleId());

                Discussion savedReply = discussionRepository.save(replyRequest);

                // Send Email Notification to the parent author (if not self-reply)
                if (!parent.getUser().getId().equals(user.getId())) {
                        try {
                                String threadTitle = parent.getContent();
                                if (threadTitle.length() > 50)
                                        threadTitle = threadTitle.substring(0, 47) + "...";

                                emailService.sendReplyNotification(
                                                parent.getUser().getEmail(),
                                                parent.getUser().getFirstName(),
                                                threadTitle);
                        } catch (Exception e) {
                                System.err.println("Failed to send reply notification: " + e.getMessage());
                        }
                }

                return ResponseEntity.ok(savedReply);
        }

        @PutMapping("/{id}/upvote")
        public ResponseEntity<Discussion> upvoteDiscussion(@PathVariable Long id) {
                Discussion discussion = discussionRepository.findById(Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Discussion not found"));

                discussion.setUpvotes(discussion.getUpvotes() + 1);
                return ResponseEntity.ok(discussionRepository.save(discussion));
        }
}
