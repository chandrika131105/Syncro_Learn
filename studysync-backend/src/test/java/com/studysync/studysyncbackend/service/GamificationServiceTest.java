package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.model.Badge;
import com.studysync.studysyncbackend.model.EarnedBadge;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.BadgeRepository;
import com.studysync.studysyncbackend.repository.EarnedBadgeRepository;
import com.studysync.studysyncbackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GamificationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BadgeRepository badgeRepository;

    @Mock
    private EarnedBadgeRepository earnedBadgeRepository;

    @InjectMocks
    private GamificationService gamificationService;

    @Captor
    private ArgumentCaptor<EarnedBadge> earnedBadgeCaptor;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("pw")
                .points(10)
                .build();
    }

    @Test
    void addPoints_existingUser_updatesPointsAndSaves() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        gamificationService.addPoints(1L, 5);

        assertThat(user.getPoints()).isEqualTo(15);
        verify(userRepository, times(1)).save(Objects.requireNonNull(user));
    }

    @Test
    void awardBadge_whenAlreadyEarned_doesNotSaveEarnedBadge() {
        when(earnedBadgeRepository.existsByUser_IdAndBadge_BadgeCode(1L, "CODE1")).thenReturn(true);

        gamificationService.awardBadge(1L, "CODE1");

        verify(earnedBadgeRepository, never()).save(Objects.requireNonNull(any(EarnedBadge.class)));
    }

    @Test
    @SuppressWarnings("null")
    void awardBadge_whenNotEarned_savesEarnedBadge() {
        when(earnedBadgeRepository.existsByUser_IdAndBadge_BadgeCode(1L, "CODE2")).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        Badge badge = Badge.builder().id(2L).badgeCode("CODE2").name("Test Badge").build();
        when(badgeRepository.findByBadgeCode("CODE2")).thenReturn(Optional.of(badge));

        gamificationService.awardBadge(1L, "CODE2");

        verify(earnedBadgeRepository, times(1)).save(capture(earnedBadgeCaptor));
        EarnedBadge saved = earnedBadgeCaptor.getValue();
        assertThat(saved.getUser()).isEqualTo(user);
        assertThat(saved.getBadge()).isEqualTo(badge);
    }

    private <T> T capture(ArgumentCaptor<T> captor) {
        captor.capture();
        return null;
    }
}
