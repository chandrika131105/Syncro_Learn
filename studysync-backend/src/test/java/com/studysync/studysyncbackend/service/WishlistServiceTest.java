package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.model.User;

import com.studysync.studysyncbackend.repository.CourseRepository;
import com.studysync.studysyncbackend.repository.WishlistItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {

    @Mock
    private WishlistItemRepository wishlistItemRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CourseService courseService;

    @InjectMocks
    private WishlistService wishlistService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(10L).email("u@example.com").password("pw").build();
    }

    @Test
    void addItemToWishlist_alreadyExists_throws() {
        when(courseRepository.findById(5L)).thenReturn(Optional.of(Course.builder().id(5L).build()));
        when(wishlistItemRepository.existsByUserIdAndCourseId(user.getId(), 5L)).thenReturn(true);

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(user);
        SecurityContext sc = mock(SecurityContext.class);
        when(sc.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sc);

        assertThatThrownBy(() -> wishlistService.addItemToWishlist(5L)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void removeItemFromWishlist_notFound_throws() {
        when(wishlistItemRepository.findByUserIdAndCourseId(user.getId(), 7L)).thenReturn(Optional.empty());

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(user);
        SecurityContext sc = mock(SecurityContext.class);
        when(sc.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sc);

        assertThatThrownBy(() -> wishlistService.removeItemFromWishlist(7L))
                .isInstanceOf(jakarta.persistence.EntityNotFoundException.class);
    }
}
