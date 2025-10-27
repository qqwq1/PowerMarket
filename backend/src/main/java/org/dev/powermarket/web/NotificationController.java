package org.dev.powermarket.web;

import org.dev.powermarket.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.dev.powermarket.service.dto.NotificationDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Получить все уведомления", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(notificationService.getMyNotifications(principal.getUsername()));
    }

    @GetMapping("/unread")
    @Operation(summary = "Получить непрочитанные уведомления",
            security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(principal.getUsername()));
    }

    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Отметить уведомление как прочитанное",
            security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID notificationId) {
        notificationService.markAsRead(principal.getUsername(), notificationId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    @Operation(summary = "Отметить все уведомления как прочитанные",
            security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserDetails principal) {
        notificationService.markAllAsRead(principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
