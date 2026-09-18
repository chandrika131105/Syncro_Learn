package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test-email")
@RequiredArgsConstructor
public class TestEmailController {

    private final EmailService emailService;

    private final com.studysync.studysyncbackend.service.CertificateService certificateService;

    @PostMapping("/send")
    public ResponseEntity<String> sendTestEmail(@RequestParam String toEmail) {
        try {
            emailService.sendWelcomeEmail(toEmail, "Harsha Vardhan", "Test Course 101", "Professor Snape");
            return ResponseEntity.ok("Test email sent successfully to " + toEmail);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to send email: " + e.getMessage());
        }
    }

    @PostMapping("/send-cert")
    public ResponseEntity<String> sendTestCertificate(@RequestParam String toEmail) {
        try {
            // Mock Data
            var user = com.studysync.studysyncbackend.model.User.builder()
                    .firstName("Harsha").lastName("Vardhan").email(toEmail).build();

            var course = com.studysync.studysyncbackend.model.Course.builder()
                    .title("Advanced Java Mastery").build();

            var cert = com.studysync.studysyncbackend.model.Certificate.builder()
                    .user(user)
                    .course(course)
                    .issueDate(java.time.LocalDateTime.now())
                    .verificationCode(java.util.UUID.randomUUID().toString())
                    .build();

            // Generate Real PDF
            byte[] pdfBytes = certificateService.createPdf(cert);

            // Send Email
            emailService.sendCertificateEmail(toEmail, "Harsha Vardhan", "Advanced Java Mastery", pdfBytes);

            return ResponseEntity.ok("Certificate email sent successfully to " + toEmail);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to send certificate: " + e.getMessage());
        }
    }
}
