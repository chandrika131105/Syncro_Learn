package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.CourseRequestDto;
import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.CourseRepository;
import com.studysync.studysyncbackend.repository.ModuleRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private ModuleRepository moduleRepository;

    @InjectMocks
    private CourseService courseService;

    private User tutor;
    private SecurityContext originalContext;

    @BeforeEach
    void setUp() {
        tutor = User.builder().id(100L).email("tutor@example.com").password("pw").build();
        // save original SecurityContext to restore later
        originalContext = SecurityContextHolder.getContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.setContext(originalContext);
    }

    @Test
    void updateCourse_notOwner_throwsAccessDenied() {
        Course existing = Course.builder().id(1L).title("Old").tutor(User.builder().id(200L).build()).build();
        when(courseRepository.findById(1L)).thenReturn(Optional.of(existing));

        // set authenticated principal as tutor (different id)
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(tutor);
        SecurityContext sc = mock(SecurityContext.class);
        when(sc.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sc);

        CourseRequestDto dto = new CourseRequestDto();
        dto.setTitle("New");

        assertThatThrownBy(() -> courseService.updateCourse(1L, dto))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
    }

    @Test
    @SuppressWarnings("null")
    void updateCourse_owner_updatesSuccessfully() {
        Course existing = Course.builder().id(2L).title("Old").tutor(tutor).build();
        when(courseRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(courseRepository.save(any(Course.class)))
                .thenAnswer(i -> Objects.requireNonNull((Course) i.getArgument(0)));

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(tutor);
        SecurityContext sc = mock(SecurityContext.class);
        when(sc.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sc);

        CourseRequestDto dto = new CourseRequestDto();
        dto.setTitle("Updated Title");
        dto.setDescription("Desc");

        var updated = courseService.updateCourse(2L, dto);
        assertThat(updated.getTitle()).isEqualTo("Updated Title");
        verify(courseRepository, times(1)).save(Objects.requireNonNull(existing));
    }

}
