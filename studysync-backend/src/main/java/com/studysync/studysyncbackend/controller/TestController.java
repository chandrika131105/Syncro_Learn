package com.studysync.studysyncbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal; // Import Principal

@RestController
@RequestMapping("/api/test") // Base path for test endpoints
public class TestController {

    @GetMapping("/hello")
    public ResponseEntity<String> sayHelloAuthenticated(Principal principal) {
        // Principal contains the authenticated user's details (email in our case)
        String username = (principal != null) ? principal.getName() : "Unknown User";
        return ResponseEntity.ok("Hello, authenticated user: " + username + "! This is a protected endpoint.");
    }
}