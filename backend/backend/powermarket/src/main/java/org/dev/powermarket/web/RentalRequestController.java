package org.dev.powermarket.web;

import org.dev.powermarket.service.RentalRequestService;
import org.dev.powermarket.service.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rental-requests")
public class RentalRequestController {

    private final RentalRequestService rentalRequestService;

    public RentalRequestController(RentalRequestService rentalRequestService) {
        this.rentalRequestService = rentalRequestService;
    }

    @PostMapping
    @Operation(summary = "Создать запрос на аренду (только для арендаторов)",
            security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<RentalRequestDto> createRequest(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CreateRentalRequestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(rentalRequestService.createRentalRequest(principal.getUsername(), request));
    }

    @PostMapping("/{requestId}/respond")
    @Operation(summary = "Ответить на запрос (одобрить/отклонить)",
            security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<RentalRequestDto> respondToRequest(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID requestId,
            @Valid @RequestBody RespondToRentalRequestRequest request) {
        return ResponseEntity.ok(rentalRequestService.respondToRequest(
                principal.getUsername(), requestId, request));
    }

    @GetMapping("/my")
    @Operation(summary = "Получить мои запросы (входящие для поставщика, исходящие для арендатора)",
            security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<List<RentalRequestDto>> getMyRequests(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(rentalRequestService.getMyRequests(principal.getUsername()));
    }

    @GetMapping("/{requestId}")
    @Operation(summary = "Получить запрос по ID", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<RentalRequestDto> getRequest(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID requestId) {
        return ResponseEntity.ok(rentalRequestService.getRequest(principal.getUsername(), requestId));
    }
}
