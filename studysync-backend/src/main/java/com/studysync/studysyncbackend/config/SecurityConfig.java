package com.studysync.studysyncbackend.config;

import com.studysync.studysyncbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final UserRepository userRepository;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthFilter)
                        throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .headers(headers -> headers
                                                .contentSecurityPolicy(csp -> csp.policyDirectives(
                                                                "default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';"))
                                                .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true)
                                                                .maxAgeInSeconds(31536000))
                                                .frameOptions(frame -> frame.deny())
                                                .contentTypeOptions(org.springframework.security.config.Customizer
                                                                .withDefaults())
                                                .xssProtection(xss -> xss.headerValue(
                                                                org.springframework.security.web.header.writers.XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK)))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers("/uploads/**").permitAll()
                                                .requestMatchers("/api/files/**").permitAll() // Optional: if you want
                                                                                              // public upload/download
                                                .requestMatchers("/ws/**").permitAll()
                                                .requestMatchers("/api/certificates/verify/**").permitAll() // Public
                                                                                                            // verification
                                                .requestMatchers("/api/test-email/**").permitAll() // TEMPORARY: For
                                                                                                   // testing email
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                // Restrict CORS origins to the specific frontend URL for tightened security
                configuration.setAllowedOrigins(List.of("http://localhost:5173"));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public UserDetailsService userDetailsService() {
                return username -> userRepository.findByEmail(username)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with email: " + username));
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }
}