package com.studysync.studysyncbackend.model;

import jakarta.persistence.*; // JPA annotations for database mapping
import lombok.Data; // Lombok annotation to generate getters, setters, etc.
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.security.core.GrantedAuthority; // Spring Security interfaces
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data // Lombok: Generates getters, setters, toString, equals, hashCode
@Builder // Lombok: Provides a builder pattern for object creation
@NoArgsConstructor // Lombok: Generates a no-argument constructor
@AllArgsConstructor // Lombok: Generates a constructor with all arguments
@Entity // JPA: Marks this class as a database entity (a table)
@Table(name = "users") // JPA: Specifies the table name (using "users" instead of "user")
public class User implements UserDetails { // Implement UserDetails for Spring Security

    @Id // JPA: Marks this field as the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // JPA: Configures auto-increment for the ID
    private Long id;

    // Using nullable=false for mandatory fields, unique=true for unique constraints
    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password; // Store the hashed password

    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING) // JPA: Stores the enum value as a String (e.g., "STUDENT")
    @Column(nullable = false)
    private Role role;

    @Builder.Default
    @Column(nullable = false)
    private long points = 0; // User points for gamification

    private String avatarUrl;
    private String profession;
    private String bio;

    @Builder.Default
    private int currentStreak = 0;
    private java.time.LocalDate lastLoginDate;

    // --- UserDetails Methods (Required by Spring Security) ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Returns a list containing the user's role (e.g., "STUDENT")
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        // Spring Security uses this method; we use email as the username
        return email;
    }

    // Return the stored password
    @Override
    public String getPassword() {
        return password;
    }

    @Builder.Default
    private boolean isBanned = false; // New field for banning users

    // These methods manage account status (we'll keep them simple for now)
    @Override
    public boolean isAccountNonExpired() {
        return true; // Account never expires
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isBanned; // Account is locked if user is banned
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Password never expires
    }

    @Override
    public boolean isEnabled() {
        return true; // Account is always enabled
    }
}