package org.dev.powermarket.web;

import org.dev.powermarket.service.ChatService;
import org.dev.powermarket.service.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/my")
    @Operation(summary = "Получить мои чаты", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<List<ChatDto>> getMyChats(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(chatService.getMyChats(principal.getUsername()));
    }

    @GetMapping("/{chatId}")
    @Operation(summary = "Получить чат по ID", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<ChatDto> getChat(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID chatId) {
        return ResponseEntity.ok(chatService.getChat(principal.getUsername(), chatId));
    }

    @GetMapping("/{chatId}/messages")
    @Operation(summary = "Получить все сообщения чата", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<List<ChatMessageDto>> getChatMessages(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID chatId) {
        return ResponseEntity.ok(chatService.getChatMessages(principal.getUsername(), chatId));
    }

    @PostMapping("/{chatId}/messages")
    @Operation(summary = "Отправить сообщение в чат", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<ChatMessageDto> sendMessage(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID chatId,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(principal.getUsername(), chatId, request));
    }
}
