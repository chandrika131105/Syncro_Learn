package com.studysync.studysyncbackend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.studysync.studysyncbackend.model.Certificate;
import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;

    public Certificate generateCertificate(User user, Course course) {
        if (certificateRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            return certificateRepository.findByUserIdAndCourseId(user.getId(), course.getId()).get();
        }

        Certificate certificate = Certificate.builder()
                .user(user)
                .course(course)
                .issueDate(LocalDateTime.now())
                .verificationCode(UUID.randomUUID().toString())
                .build();

        return certificateRepository.save(certificate);
    }

    public byte[] createPdf(Certificate certificate) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // Colors
            java.awt.Color darkBlue = new java.awt.Color(0, 51, 102); // Navy
            java.awt.Color premiumGold = new java.awt.Color(218, 165, 32); // GoldenRod
            java.awt.Color ribbonRed = new java.awt.Color(178, 34, 34); // Firebrick
            java.awt.Color parchment = new java.awt.Color(253, 250, 240); // FloralWhite
            java.awt.Color darkGray = java.awt.Color.DARK_GRAY;
            java.awt.Color lightWatermark = new java.awt.Color(230, 230, 230);

            PdfContentByte canvas = writer.getDirectContent();
            PdfContentByte underCanvas = writer.getDirectContentUnder();
            Rectangle pageSize = document.getPageSize();
            float width = pageSize.getWidth();
            float height = pageSize.getHeight();

            // 1. Background (Parchment Fill)
            underCanvas.setColorFill(parchment);
            underCanvas.rectangle(0, 0, width, height);
            underCanvas.fill();

            // 2. Watermark (Background)
            ColumnText.showTextAligned(underCanvas, Element.ALIGN_CENTER,
                    new Phrase("STUDYSYNC", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 110, lightWatermark)),
                    width / 2, height / 2, 45);

            // 3. Ornate Border
            float offset = 25;
            float lineWidth = 100;

            // Double Line Border
            canvas.setColorStroke(darkBlue);
            canvas.setLineWidth(4f);
            canvas.rectangle(offset, offset, width - 2 * offset, height - 2 * offset);
            canvas.stroke();

            canvas.setColorStroke(premiumGold);
            canvas.setLineWidth(1.5f);
            canvas.rectangle(offset + 5, offset + 5, width - 2 * (offset + 5), height - 2 * (offset + 5));
            canvas.stroke();

            // Inner decorative border (thinner line)
            canvas.setColorStroke(darkBlue);
            canvas.setLineWidth(0.5f);
            canvas.rectangle(offset + 12, offset + 12, width - 2 * (offset + 12), height - 2 * (offset + 12));
            canvas.stroke();

            // Corner Flourishes (Classic "L" shapes)
            canvas.setLineWidth(3f);
            canvas.setColorStroke(premiumGold);

            // Top Left
            canvas.moveTo(offset + 15, offset + lineWidth);
            canvas.lineTo(offset + 15, offset + 15);
            canvas.lineTo(offset + lineWidth, offset + 15);
            canvas.stroke();

            // Top Right
            canvas.moveTo(width - offset - lineWidth, offset + 15);
            canvas.lineTo(width - offset - 15, offset + 15);
            canvas.lineTo(width - offset - 15, offset + lineWidth);
            canvas.stroke();

            // Bottom Right
            canvas.moveTo(width - offset - 15, height - offset - lineWidth);
            canvas.lineTo(width - offset - 15, height - offset - 15);
            canvas.lineTo(width - offset - lineWidth, height - offset - 15);
            canvas.stroke();

            // Bottom Left
            canvas.moveTo(offset + lineWidth, height - offset - 15);
            canvas.lineTo(offset + 15, height - offset - 15);
            canvas.lineTo(offset + 15, height - offset - lineWidth);
            canvas.stroke();

            // 4. Content Layout
            PdfPTable table = new PdfPTable(1);
            table.setWidthPercentage(100);
            table.getDefaultCell().setBorder(Rectangle.NO_BORDER);
            table.getDefaultCell().setHorizontalAlignment(Element.ALIGN_CENTER);

            // Spicers
            PdfPCell spacer = new PdfPCell(new Phrase(" "));
            spacer.setBorder(Rectangle.NO_BORDER);
            spacer.setFixedHeight(20);
            table.addCell(spacer);

            // Header - StudySync Academy
            Font headerFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 16, premiumGold);
            chunk(table, "S T U D Y S Y N C   A C A D E M Y", headerFont, 10); // Spaced out for premium feel

            // Main Title
            Font titleFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 42, darkBlue);
            chunk(table, "Certificate of Completion", titleFont, 20);

            // Subtitle
            Font subtitleFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 18, darkGray); // Serif for formal look
            chunk(table, "This is to certify that", subtitleFont, 10);

            // Student Name (The Hero)
            Font nameFont = FontFactory.getFont(FontFactory.TIMES_BOLDITALIC, 42, darkBlue);
            chunk(table, certificate.getUser().getFirstName() + " " + certificate.getUser().getLastName(), nameFont, 5);

            // Detailed Decorative Line under Name
            // Draw visually
            PdfContentByte lineCanvas = writer.getDirectContent();
            lineCanvas.setColorStroke(premiumGold);
            lineCanvas.setLineWidth(2f);

            // Let's use specific cell padding to manage spacing instead of absolute lines
            // which might break layout
            PdfPCell lineCell = new PdfPCell(new Phrase("__________________________________________",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, premiumGold)));
            lineCell.setBorder(Rectangle.NO_BORDER);
            lineCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            lineCell.setPaddingBottom(20);
            table.addCell(lineCell);

            // Check content
            chunk(table, "has successfully completed the course", subtitleFont, 10);

            // Course Name
            Font courseFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 30, darkBlue);
            chunk(table, certificate.getCourse().getTitle(), courseFont, 35);

            // 5. Seal & Ribbon (Bottom Center-Left)
            // Move seal slightly to avoid text collision
            float sealX = 120;
            float sealY = 110;
            float sealRadius = 45;

            // Ribbon Tails (Behind Seal)
            canvas.setColorFill(ribbonRed);
            // Left Tail
            canvas.moveTo(sealX, sealY);
            canvas.lineTo(sealX - 30, sealY - 80);
            canvas.lineTo(sealX - 10, sealY - 70); // V-notch left inner
            canvas.lineTo(sealX + 10, sealY - 70); // V-notch right inner
            canvas.lineTo(sealX + 30, sealY - 80);
            canvas.lineTo(sealX, sealY);
            canvas.fill();

            // Seal Body
            canvas.setColorFill(premiumGold);
            canvas.circle(sealX, sealY, sealRadius);
            canvas.fill();

            // Seal Inner Ring
            canvas.setColorStroke(darkBlue);
            canvas.setLineWidth(1f);
            canvas.circle(sealX, sealY, sealRadius - 4);
            canvas.stroke();

            // Seal Text
            ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                    new Phrase("OFFICIAL", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, darkBlue)),
                    sealX, sealY + 15, 0);
            ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                    new Phrase("CERTIFIED", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, darkBlue)),
                    sealX, sealY - 5, 0);
            ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                    new Phrase("\u2605 \u2605 \u2605", FontFactory.getFont(FontFactory.HELVETICA, 10, darkBlue)), // Stars
                    sealX, sealY - 25, 0);

            // Footer Table
            PdfPTable footerTable = new PdfPTable(3);
            footerTable.setWidthPercentage(85);
            footerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

            // Left Column: Date & ID
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
            String dateStr = certificate.getIssueDate().format(formatter);
            Font smallFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 11, darkGray);
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.addElement(new Paragraph("Date Issued: " + dateStr, smallFont));
            leftCell.addElement(
                    new Paragraph("Certificate ID: " + certificate.getVerificationCode().substring(0, 8), smallFont));
            leftCell.setHorizontalAlignment(Element.ALIGN_LEFT);
            footerTable.addCell(leftCell);

            // Center: Spacer
            PdfPCell centerSpacer = new PdfPCell(new Phrase(" "));
            centerSpacer.setBorder(Rectangle.NO_BORDER);
            footerTable.addCell(centerSpacer);

            // Right: Signature
            Font signFont = FontFactory.getFont("ZapfChancery", 20, darkBlue);
            PdfPCell signCell = new PdfPCell();
            signCell.setBorder(Rectangle.NO_BORDER);
            signCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            PdfPTable signBox = new PdfPTable(1);
            signBox.getDefaultCell().setBorder(Rectangle.NO_BORDER);
            signBox.getDefaultCell().setHorizontalAlignment(Element.ALIGN_CENTER);

            // The signature itself
            PdfPCell sig = new PdfPCell(new Phrase("StudySync Director", signFont));
            sig.setBorder(Rectangle.NO_BORDER);
            sig.setHorizontalAlignment(Element.ALIGN_CENTER);
            sig.setPaddingBottom(5);
            signBox.addCell(sig);

            // The Line
            PdfPCell line = new PdfPCell(
                    new Phrase("__________________________", FontFactory.getFont(FontFactory.HELVETICA, 10, darkBlue)));
            line.setBorder(Rectangle.NO_BORDER);
            line.setHorizontalAlignment(Element.ALIGN_CENTER);
            signBox.addCell(line);

            // The Title
            PdfPCell jobTitle = new PdfPCell(new Phrase("Director of Education", smallFont));
            jobTitle.setBorder(Rectangle.NO_BORDER);
            jobTitle.setHorizontalAlignment(Element.ALIGN_CENTER);
            signBox.addCell(jobTitle);

            signCell.addElement(signBox);
            footerTable.addCell(signCell);

            table.addCell(footerTable);

            document.add(table);
            document.close();

            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private void chunk(PdfPTable table, String text, Font font, float padding) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPaddingBottom(padding);
        table.addCell(cell);
    }

    public Optional<Certificate> getCertificate(Long id) {
        return certificateRepository.findById(id);
    }

    public Optional<Certificate> getByCourseAndUser(Long courseId, Long userId) {
        return certificateRepository.findByUserIdAndCourseId(userId, courseId);
    }

    public Optional<Certificate> verifyCertificate(String code) {
        return certificateRepository.findByVerificationCode(code);
    }
}
