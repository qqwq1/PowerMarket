
package org.dev.powermarket.service;

import org.dev.powermarket.repository.ChatRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatAccessServiceTest {

    @Mock
    private ChatRepository chatRepository;
    @Mock
    private UserService userService;

    @InjectMocks
    private ChatAccessService chatAccessService;

    @Test
    void hasAccessToChat_withEmail_resolvesUserAndChecksRepository() {
        String email = "user@example.com";
        UUID chatId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(userService.getUserIdByEmail(email)).thenReturn(userId);
        when(chatRepository.userHasAccessToChat(userId, chatId)).thenReturn(true);

        boolean result = chatAccessService.hasAccessToChat(email, chatId);

        assertThat(result).isTrue();
        verify(userService).getUserIdByEmail(email);
        verify(chatRepository).userHasAccessToChat(userId, chatId);
    }

    @Test
    void hasAccessToChat_withUserId_returnsRepositoryValue() {
        UUID userId = UUID.randomUUID();
        UUID chatId = UUID.randomUUID();

        when(chatRepository.userHasAccessToChat(userId, chatId)).thenReturn(false);

        boolean result = chatAccessService.hasAccessToChat(userId, chatId);

        assertThat(result).isFalse();
        verify(chatRepository).userHasAccessToChat(userId, chatId);
        verifyNoInteractions(userService);
    }
}
