package com.studysync.studysyncbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // Normalize file name
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            originalFileName = "unnamed_file";
        }
        String fileName = StringUtils.cleanPath(originalFileName);

        try {
            // Check if the file's name contains invalid characters
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            // Strict File Type Validation (MIME type & Extension)
            String contentType = file.getContentType();
            // Expanded whitelist to include common course materials
            List<String> allowedMimeTypes = List.of("image/jpeg", "image/png", "image/jpg", "video/mp4",
                    "application/pdf");
            if (contentType == null || !allowedMimeTypes.contains(contentType)) {
                throw new IllegalArgumentException("Invalid file type. Allowed: images (jpeg, png), video (mp4), pdf.");
            }

            String fileExtension = "";
            int i = fileName.lastIndexOf('.');
            if (i > 0) {
                fileExtension = fileName.substring(i + 1).toLowerCase();
            }
            List<String> allowedExtensions = List.of("jpg", "jpeg", "png", "mp4", "pdf");
            if (!allowedExtensions.contains(fileExtension)) {
                throw new IllegalArgumentException("Invalid file extension. Allowed: jpg, jpeg, png, mp4, pdf.");
            }

            // --- PROTECTIVE VALIDATION ---

            // 1. File Size Validation (Byte level)
            long fileSize = file.getSize();
            // Limits: Images (5MB), Videos (100MB), PDF (20MB)
            if (contentType.startsWith("image/")) {
                if (fileSize > 5 * 1024 * 1024)
                    throw new IllegalArgumentException("Image is too large. Max 5MB allowed.");
            } else if (contentType.startsWith("video/")) {
                if (fileSize > 100 * 1024 * 1024)
                    throw new IllegalArgumentException("Video is too large. Max 100MB allowed.");
            } else if (fileSize > 20 * 1024 * 1024) {
                throw new IllegalArgumentException("File is too large. Max 20MB allowed.");
            }

            // 2. Image Bomb Validation (Resolution level)
            // Checks pixel dimensions without fully decoding the image into memory
            if (contentType.startsWith("image/")) {
                validateImageDimensions(file);
            }

            // Generate unique filename
            String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;

            // Copy file to the target location (Replacing existing file with the same name)
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    private void validateImageDimensions(MultipartFile file) {
        try (InputStream is = file.getInputStream();
                ImageInputStream iis = ImageIO.createImageInputStream(is)) {

            Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
            if (readers.hasNext()) {
                ImageReader reader = readers.next();
                try {
                    reader.setInput(iis);
                    int width = reader.getWidth(0);
                    int height = reader.getHeight(0);

                    // Max resolution: 5000 x 5000 pixels
                    if (width > 5000 || height > 5000) {
                        throw new IllegalArgumentException(
                                "Image resolution is too high (" + width + "x" + height + "). Max 5000x5000 allowed.");
                    }

                    // Ratio Check (Prevent extremely thin, ultra-long "strip" images)
                    if (width / (float) height > 20 || height / (float) width > 20) {
                        throw new IllegalArgumentException(
                                "Image aspect ratio is invalid. Extreme dimensions detected.");
                    }
                } finally {
                    reader.dispose();
                }
            } else {
                throw new IllegalArgumentException("Could not read image metadata. The file may be corrupted.");
            }
        } catch (IOException e) {
            throw new RuntimeException("Error validating image dimensions", e);
        }
    }
}
