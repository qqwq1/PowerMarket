
package org.dev.powermarket.service;

import org.dev.powermarket.domain.Chat;
import org.dev.powermarket.domain.ChatMessage;
import org.dev.powermarket.domain.Rental;
import org.dev.powermarket.domain.dto.mapper.ChatMapper;
import org.dev.powermarket.domain.dto.request.EditMessageRequest;
import org.dev.powermarket.domain.dto.response.ChatDetailDto;
import org.dev.powermarket.domain.dto.response.ChatListItemDto;
import org.dev.powermarket.repository.ChatMessageRepository;
import org.dev.powermarket.repository.ChatRepository;
import org.dev.powermarket.repository.projection.UnreadCountProjection;
import org.dev.powermarket.security.entity.User;
import org.dev.powermarket.security.repository.AuthorizedUserRepository;
import org.dev.powermarket.service.dto.ChatMessageDto;
import org.dev.powermarket.service.dto.SendMessageRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatRepository chatRepository;
    @Mock
    private ChatMessageRepository messageRepository;
    @Mock
    private AuthorizedUserRepository userRepository;
    @Mock
    private ChatMapper chatMapper;

    @InjectMocks
    private ChatService chatService;

    private final String email = "user@example.com";

    @Test
    void getMyChats_returnsDtosWithUnreadCounts() {
        User user = buildUser("supplier");
        Chat chat = buildChat(user, buildUser("tenant"));
        Pageable pageable = PageRequest.of(0, 5);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(chatRepository.findChatsByUserId(user.getId(), pageable))
                .thenReturn(new PageImpl<>(List.of(chat), pageable, 1));
        ChatMessage lastMessage = buildMessage(chat, user, "last");
        when(messageRepository.findLastMessagesForChats(List.of(chat.getId())))
                .thenReturn(List.of(lastMessage));
        when(messageRepository.countUnreadMessagesByChat(user.getId()))
                .thenReturn(List.of(new TestUnreadCountProjection(chat.getId(), 3L)));
        ChatListItemDto dto = mock(ChatListItemDto.class);
        when(chatMapper.toListItemDto(chat, user, lastMessage, 3)).thenReturn(dto);

        Page<ChatListItemDto> result = chatService.getMyChats(email, pageable);

        assertThat(result.getContent()).containsExactly(dto);
    }

    @Test
    void getChatMessages_marksUnreadAndMapsDtos() {
        User user = buildUser("supplier");
        Chat chat = buildChat(user, buildUser("tenant"));
        ChatMessage unread = buildMessage(chat, buildUser("tenant"), "hi");
        Pageable pageable = PageRequest.of(0, 20);
        ChatMessageDto dto = mock(ChatMessageDto.class);

        when(chatRepository.findById(chat.getId())).thenReturn(Optional.of(chat));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(messageRepository.findUnreadMessages(chat.getId(), user.getId()))
                .thenReturn(List.of(unread));
        when(messageRepository.findVisibleMessagesByChat(chat, user.getId(), pageable))
                .thenReturn(new PageImpl<>(List.of(unread), pageable, 1));
        when(chatMapper.toMessageDto(unread)).thenReturn(dto);

        Page<ChatMessageDto> page = chatService.getChatMessages(email, chat.getId(), pageable);

        assertThat(page.getContent()).containsExactly(dto);
        verify(messageRepository).saveAll(List.of(unread));
        verify(chatRepository).save(chat);
    }

    @Test
    void sendMessage_persistsMessageAndUpdatesChat() {
        User supplier = buildUser("supplier");
        User tenant = buildUser("tenant");
        Chat chat = buildChat(supplier, tenant);
        SendMessageRequest request = new SendMessageRequest("hello");
        ChatMessageDto dto = mock(ChatMessageDto.class);

        when(chatRepository.findById(chat.getId())).thenReturn(Optional.of(chat));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(supplier));
        when(messageRepository.findUnreadMessages(chat.getId(), supplier.getId()))
                .thenReturn(List.of());
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });
        when(chatMapper.toMessageDto(any(ChatMessage.class))).thenReturn(dto);

        ChatMessageDto result = chatService.sendMessage(email, chat.getId(), request);

        assertThat(result).isSameAs(dto);
        verify(chatRepository).save(chat);
    }

    @Test
    void editMessage_updatesContentWithinTimeout() {
        User user = buildUser("sender");
        Chat chat = buildChat(user, buildUser("tenant"));
        ChatMessage message = buildMessage(chat, user, "old");
        message.setCreatedAt(Instant.now().minusSeconds(30));
        message.setDeletedForEveryone(false);
        message.setDeletedForSender(false);
        message.setEdited(false);
        ChatMessageDto dto = mock(ChatMessageDto.class);

        when(messageRepository.findById(message.getId())).thenReturn(Optional.of(message));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(messageRepository.save(message)).thenReturn(message);
        when(messageRepository.findFirstVisibleByChat(eq(chat), isNull()))
                .thenReturn(Optional.of(message));
        when(chatMapper.toMessageDto(message)).thenReturn(dto);

        ChatMessageDto result = chatService.editMessage(email, message.getId(),
                new EditMessageRequest("new"));

        assertThat(result).isSameAs(dto);
        assertThat(message.getContent()).isEqualTo("new");
        assertThat(message.isEdited()).isTrue();
        verify(chatRepository).save(chat);
    }

    @Test
    void deleteMessage_forEveryoneMarksAndUpdatesChat() {
        User sender = buildUser("sender");
        Chat chat = buildChat(sender, buildUser("tenant"));
        ChatMessage message = buildMessage(chat, sender, "to delete");
        ChatMessage previous = buildMessage(chat, sender, "prev");

        when(messageRepository.findById(message.getId())).thenReturn(Optional.of(message));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(sender));
        when(messageRepository.findFirstVisibleByChat(eq(chat), isNull()))
                .thenReturn(Optional.of(previous));

        chatService.deleteMessage(email, message.getId(), true);

        assertThat(message.isDeletedForEveryone()).isTrue();
        verify(messageRepository).save(message);
        verify(chatRepository).save(chat);
    }

    @Test
    void deleteMessage_forSenderOnlyMarksFlag() {
        User sender = buildUser("sender");
        Chat chat = buildChat(sender, buildUser("tenant"));
        ChatMessage message = buildMessage(chat, sender, "to delete");

        when(messageRepository.findById(message.getId())).thenReturn(Optional.of(message));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(sender));

        chatService.deleteMessage(email, message.getId(), false);

        assertThat(message.isDeletedForSender()).isTrue();
        verify(messageRepository).save(message);
        verify(chatRepository, never()).save(any());
    }

    @Test
    void getUnreadMessagesCount_returnsRepositoryValue() {
        User user = buildUser("supplier");
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(messageRepository.countUnreadMessages(user.getId())).thenReturn(7L);

        long count = chatService.getUnreadMessagesCount(email);

        assertThat(count).isEqualTo(7L);
    }

    @Test
    void markMessagesAsRead_marksAllAndClearsFlag() {
        User user = buildUser("supplier");
        Chat chat = buildChat(user, buildUser("tenant"));
        ChatMessage unread = buildMessage(chat, buildUser("tenant"), "unread");

        when(chatRepository.findById(chat.getId())).thenReturn(Optional.of(chat));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(messageRepository.findUnreadMessages(chat.getId(), user.getId()))
                .thenReturn(List.of(unread));

        chatService.markMessagesAsRead(email, chat.getId());

        assertThat(unread.getReadAt()).isNotNull();
        verify(messageRepository).saveAll(List.of(unread));
        verify(chatRepository).save(chat);
    }

    @Test
    void markAllMessagesAsRead_marksEveryUnreadAndUpdatesChats() {
        User user = buildUser("supplier");
        Chat chat1 = buildChat(user, buildUser("tenant1"));
        Chat chat2 = buildChat(user, buildUser("tenant2"));
        ChatMessage msg1 = buildMessage(chat1, buildUser("tenant1"), "m1");
        ChatMessage msg2 = buildMessage(chat2, buildUser("tenant2"), "m2");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(messageRepository.findAllUnreadMessages(user.getId()))
                .thenReturn(List.of(msg1, msg2));

        chatService.markAllMessagesAsRead(email);

        assertThat(msg1.getReadAt()).isNotNull();
        assertThat(msg2.getReadAt()).isNotNull();
        verify(messageRepository).saveAll(List.of(msg1, msg2));
        verify(chatRepository, times(2)).save(any(Chat.class));
    }

    @Test
    void getChatDetail_returnsMapperResult() {
        User supplier = buildUser("supplier");
        User tenant = buildUser("tenant");
        Chat chat = buildChat(supplier, tenant);
        ChatMessage lastVisible = buildMessage(chat, tenant, "last");
        ChatMessage unread = buildMessage(chat, tenant, "new");
        unread.setDeletedForEveryone(false);
        ChatDetailDto detailDto = mock(ChatDetailDto.class);

        when(chatRepository.findById(chat.getId())).thenReturn(Optional.of(chat));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(supplier));
        when(messageRepository.findVisibleMessagesByChat(eq(chat), eq(supplier.getId()), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(lastVisible)));
        when(messageRepository.findFirstVisibleByChat(chat, supplier.getId()))
                .thenReturn(Optional.of(lastVisible));
        when(messageRepository.findUnreadMessages(chat.getId(), supplier.getId()))
                .thenReturn(List.of(unread));
        when(chatMapper.toDetailDto(eq(chat), eq(supplier), anyList(), eq(lastVisible), eq(1)))
                .thenReturn(detailDto);

        ChatDetailDto result = chatService.getChatDetail(email, chat.getId());

        assertThat(result).isSameAs(detailDto);
    }

    private User buildUser(String label) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(label + "@example.com");
        return user;
    }

    private Chat buildChat(User supplier, User tenant) {
        Chat chat = new Chat();
        chat.setId(UUID.randomUUID());
        chat.setHasUnread(true);
        Rental rental = new Rental();
        rental.setSupplier(supplier);
        rental.setTenant(tenant);
        chat.setRental(rental);
        return chat;
    }

    private ChatMessage buildMessage(Chat chat, User sender, String content) {
        ChatMessage message = new ChatMessage();
        message.setId(UUID.randomUUID());
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(content);
        message.setDeletedForEveryone(false);
        message.setDeletedForSender(false);
        message.setCreatedAt(Instant.now());
        return message;
    }

    private record TestUnreadCountProjection(UUID chatId, Long count) implements UnreadCountProjection {
        @Override public UUID getChatId() { return chatId; }
        @Override public Long getCount() { return count; }
    }
}
