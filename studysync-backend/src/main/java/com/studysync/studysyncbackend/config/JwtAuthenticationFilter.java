package com.studysync.studysyncbackend.config;

import com.studysync.studysyncbackend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter; // Ensures the filter runs only once per request

import java.io.IOException;

@Component // Marks this as a Spring component, making it available for dependency
           // injection
@RequiredArgsConstructor // Lombok creates constructor with final fields
public class JwtAuthenticationFilter extends OncePerRequestFilter { // Extends base class for filters

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; // Spring Security's service to load user details

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, // The incoming HTTP request
            @NonNull HttpServletResponse response, // The outgoing HTTP response
            @NonNull FilterChain filterChain // The chain of filters to pass the request along
    ) throws ServletException, IOException {

        // 1. Extract the Authorization header
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 2. Check if the header exists and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // If not, pass the request along and exit
            return;
        }

        // 3. Extract the JWT token (substring after "Bearer ")
        jwt = authHeader.substring(7);

        // 4. Extract the user email from the token using JwtService
        userEmail = jwtService.extractUsername(jwt);

        // 5. Check if email exists and the user is not already authenticated
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load user details from the database using UserDetailsService
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 6. Validate the token against the user details
            // Also check if the account is not locked (i.e., not banned)
            if (jwtService.isTokenValid(jwt, userDetails) && userDetails.isAccountNonLocked()) {
                // If token is valid and user is not banned, create an authentication token
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null, // Credentials are null as we are using JWT
                        userDetails.getAuthorities() // User roles/permissions
                );
                // Set additional details for the authentication token (like IP address, session
                // ID)
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                // Update the SecurityContextHolder with the new authentication token
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        // 7. Pass the request along the filter chain
        filterChain.doFilter(request, response);
    }
}