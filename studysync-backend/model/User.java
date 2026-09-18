package com.studysync.studysyncbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode; // Added
import lombok.ToString;        // Added
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime; // Import LocalDateTime
import java.util.Collection;
import java.util.List;
// Assuming you might add Courses or WishlistItems later, prepare for exclusions
// import java.util.Set;
// import java.util.HashSet;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
// Add excludes if you add bidirectional relationships later (e.g., courses, wishlistItems)
// @EqualsAndHashCode(exclude = {"courses", "wishlistItems"})
// @ToString(exclude = {"courses", "wishlistItems"})
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // --- Gamification Fields ---
    @Column(nullable = false)
    @Builder.Default // Ensure Lombok builder initializes this correctly
    private Long points = 0L; // Start users with 0 points

    private LocalDateTime lastLogin; // Timestamp of the last login

    @Column(nullable = false)
    @Builder.Default // Ensure Lombok builder initializes this correctly
    private Integer loginStreak = 0; // Current consecutive login day streak

    // --- Relationships (Add later if needed) ---
    // @OneToMany(mappedBy = "tutor", cascade = CascadeType.ALL, orphanRemoval = true)
    // @Builder.Default
    // private Set<Course> courses = new HashSet<>(); // Courses created by this tutor

    // @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    // @Builder.Default
    // private Set<WishlistItem> wishlistItems = new HashSet<>(); // Items in this user's wishlist

    // --- UserDetails Methods ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
