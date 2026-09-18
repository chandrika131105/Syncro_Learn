package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.model.Certificate;
import com.studysync.studysyncbackend.service.CertificateService;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;
    private final UserRepository userRepository;
    private final com.studysync.studysyncbackend.repository.EnrollmentRepository enrollmentRepository;
    private final com.studysync.studysyncbackend.repository.CourseRepository courseRepository;

    @GetMapping("/download/{courseId}")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Certificate> certificateOpt = certificateService.getByCourseAndUser(courseId, user.getId());

        Certificate certificate;
        if (certificateOpt.isPresent()) {
            certificate = certificateOpt.get();
        } else {
            // Check eligiblity for legacy users
            var enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId);
            if (enrollment.isPresent() && enrollment.get().getProgress() == 100) {
                // testing
                var course = courseRepository.findById(courseId).orElseThrow();
                certificate = certificateService.generateCertificate(user, course);
            } else {
                return ResponseEntity.notFound().build();
            }
        }

        byte[] pdfBytes = certificateService.createPdf(certificate);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "certificate-" + courseId + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @GetMapping("/verify/{code}")
    public ResponseEntity<Certificate> verifyCertificate(@PathVariable String code) {
        return certificateService.verifyCertificate(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
