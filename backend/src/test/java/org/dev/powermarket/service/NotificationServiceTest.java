package org.dev.powermarket.service;

import org.dev.powermarket.domain.Notification;
import org.dev.powermarket.repository.NotificationRepository;
import org.dev.powermarket.security.entity.User;
import org.dev.powermarket.security.repository.AuthorizedUserRepository;
import org.dev.powermarket.service.dto.NotificationDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private AuthorizedUserRepository authorizedUserRepository;

    @InjectMocks
    private NotificationService notificationService;

    private final String email = "user@example.com";

    @Test
    void getMyNotifications_returnsMappedDtos() {
        User user = buildUser();
        Notification notification = buildNotification(user);
        when(authorizedUserRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(notificationRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(notification));

        List<NotificationDto> result = notificationService.getMyNotifications(email);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getId()).isEqualTo(notification.getId());
        verify(notificationRepository).findByUserOrderByCreatedAtDesc(user);
    }

    @Test
    void getUnreadNotifications_returnsOnlyUnreadDtos() {
        User user = buildUser();
        Notification notification = buildNotification(user);
        when(authorizedUserRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user))
                .thenReturn(List.of(notification));

        List<NotificationDto> result = notificationService.getUnreadNotifications(email);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getRead()).isFalse();
        verify(notificationRepository).findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    @Test
    void markAsRead_marksNotificationWhenOwnerMatches() {
        User user = buildUser();
        Notification notification = buildNotification(user);
        when(notificationRepository.findById(notification.getId())).thenReturn(Optional.of(notification));
        when(authorizedUserRepository.findByEmail(email)).thenReturn(Optional.of(user));

        notificationService.markAsRead(email, notification.getId());

        assertThat(notification.getIsRead()).isTrue();
        verify(notificationRepository).save(notification);
    }

    @Test
    void markAsRead_throwsWhenDifferentUser() {
        User owner = buildUser();
        User another = buildUser();
        another.setId(UUID.randomUUID());
        Notification notification = buildNotification(owner);
        when(notificationRepository.findById(notification.getId())).thenReturn(Optional.of(notification));
        when(authorizedUserRepository.findByEmail(email)).thenReturn(Optional.of(another));

        assertThrows(AccessDeniedException.class,
                () -> notificationService.markAsRead(email, notification.getId()));

        verify(notificationRepository, never()).save(notification);
    }

    @Test
    void markAllAsRead_marksEachUnreadAndPersists() {
        User user = buildUser();
        Notification unread1 = buildNotification(user);
        Notification unread2 = buildNotification(user);
        when(authorizedUserRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user))
                .thenReturn(List.of(unread1, unread2));

        notificationService.markAllAsRead(email);

        ArgumentCaptor<List<Notification>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).allMatch(Notification::getIsRead);
    }

    private User buildUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        return user;
    }

    private Notification buildNotification(User user) {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID());
        notification.setUser(user);
        notification.setTitle("title");
        notification.setMessage("msg");
        notification.setIsRead(false);
        notification.setCreatedAt(Instant.now());
        return notification;
    }
}
