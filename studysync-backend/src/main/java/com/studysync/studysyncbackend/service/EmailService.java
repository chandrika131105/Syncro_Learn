package com.studysync.studysyncbackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendWelcomeEmail(String toEmail, String userName, String courseTitle, String tutorName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            helper.setFrom(senderEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to " + courseTitle + " | StudySync Academy");

            String content = "<h2>Welcome, " + userName + "!</h2>"
                    + "<p>You have successfully enrolled in <strong>" + courseTitle + "</strong>"
                    + (tutorName != null ? " by <strong>" + tutorName + "</strong>" : "") + ".</p>"
                    + "<p>We are thrilled to have you on board. Get started by logging into your dashboard and accessing the course materials right away.</p>";

            String htmlContent = wrapInTemplate(content, "Go to Dashboard", "http://localhost:5173/dashboard");

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    public void sendCertificateEmail(String toEmail, String userName, String courseTitle, byte[] pdfBytes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true); // true = multipart for attachment

            helper.setFrom(senderEmail);
            helper.setTo(toEmail);
            helper.setSubject("Congratulations! Certificate for " + courseTitle);

            String content = "<h2>Congratulations, " + userName + "!</h2>"
                    + "<p>You have successfully completed <strong>" + courseTitle + "</strong>.</p>"
                    + "<p>Please find your official <strong>Certificate of Completion</strong> attached to this email.</p>"
                    + "<p>You can also view and verify your certificate directly on our platform.</p>";

            String htmlContent = wrapInTemplate(content, "View Certificate", "http://localhost:5173/dashboard");

            helper.setText(htmlContent, true);

            // Attach PDF
            helper.addAttachment("Certificate-" + courseTitle.replaceAll("\\s+", "_") + ".pdf",
                    new ByteArrayResource(pdfBytes));

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send certificate email", e);
        }
    }

    public void sendReplyNotification(String toEmail, String userName, String discussionTitle) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            helper.setFrom(senderEmail);
            helper.setTo(toEmail);
            helper.setSubject("New Reply: " + discussionTitle);

            String content = "<h2>Hello " + userName + ",</h2>"
                    + "<p>Someone just replied to your discussion thread: <strong>" + discussionTitle + "</strong>.</p>"
                    + "<p>Log in now to view the response and continue the conversation.</p>";

            String htmlContent = wrapInTemplate(content, "View Discussion", "http://localhost:5173/dashboard");

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send reply notification", e);
        }
    }

    private String wrapInTemplate(String bodyContent, String buttonText, String buttonLink) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />"
                + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>"
                + "<style type=\"text/css\">"
                + "  body { margin: 0; padding: 0; min-width: 100%!important; font-family: sans-serif; }"
                + "  .ExternalClass { width: 100%; }"
                + "  .content { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #333333; }"
                + "</style>"
                + "</head>"
                + "<body style=\"margin: 0; padding: 0; background-color: #f4f4f4;\">"
                + "  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color: #f4f4f4;\">"
                + "    <tr>"
                + "      <td align=\"center\" style=\"padding: 40px 0;\">"
                + "        <!-- Main Container -->"
                + "        <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"600\" style=\"background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);\">"
                + "          <!-- Header -->"
                + "          <tr>"
                + "            <td align=\"center\" style=\"background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 40px 0;\">"
                + "              <h1 style=\"margin: 0; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: 1px;\">STUDYSYNC ACADEMY</h1>"
                + "            </td>"
                + "          </tr>"
                + "          <!-- Body -->"
                + "          <tr>"
                + "            <td style=\"padding: 40px 30px; background-color: #ffffff;\">"
                + "              <div class=\"content\" style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;\">"
                + bodyContent
                + "              </div>"
                + "              <!-- Button -->"
                + "              <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin-top: 30px;\">"
                + "                <tr>"
                + "                  <td align=\"center\">"
                + "                    <a href=\"" + buttonLink
                + "\" style=\"display: inline-block; padding: 14px 30px; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; border-radius: 6px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.4);\">"
                + buttonText + "</a>"
                + "                  </td>"
                + "                </tr>"
                + "              </table>"
                + "            </td>"
                + "          </tr>"
                + "          <!-- Footer -->"
                + "          <tr>"
                + "            <td align=\"center\" style=\"background-color: #f9fafb; padding: 30px; border-top: 1px solid #eeeeee;\">"
                + "              <p style=\"margin: 0; font-family: sans-serif; font-size: 14px; color: #999999;\">&copy; "
                + java.time.Year.now().getValue() + " StudySync Academy. All rights reserved.</p>"
                + "              <p style=\"margin: 10px 0 0; font-family: sans-serif; font-size: 14px; color: #4f46e5; font-weight: bold;\">Happy Learning!</p>"
                + "            </td>"
                + "          </tr>"
                + "        </table>"
                + "      </td>"
                + "    </tr>"
                + "  </table>"
                + "</body>"
                + "</html>";
    }
}
