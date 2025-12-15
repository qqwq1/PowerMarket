package org.dev.powermarket.web;

import org.dev.powermarket.service.RentalService;
import org.dev.powermarket.service.dto.RentalDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @GetMapping("/my")
    @Operation(summary = "Получить мои аренды", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<List<RentalDto>> getMyRentals(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(rentalService.getMyRentals(principal.getUsername()));
    }

    @GetMapping("/{rentalId}")
    @Operation(summary = "Получить аренду по ID", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<RentalDto> getRental(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID rentalId) {
        return ResponseEntity.ok(rentalService.getRental(principal.getUsername(), rentalId));
    }
}
