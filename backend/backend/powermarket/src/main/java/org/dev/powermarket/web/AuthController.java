package org.dev.powermarket.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.dev.powermarket.security.jwt.UserPrincipal;
import org.dev.powermarket.service.AuthService;
import org.dev.powermarket.service.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST контроллер для аутентификации и регистрации
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration")
public class AuthController {

    private final AuthService authService;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(
            summary = "Register new user",
            description = "Register a new user with SUPPLIER or TENANT role"
    )
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(
            summary = "Authenticate user",
            description = "Authenticate user and return access and refresh tokens"
    )
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String jwt = authService.getJWTToken(authentication);
        UserPrincipal userDetails = authService.loginUser(authentication);
        List<String> roles = authService.getRolesByUser(userDetails);

        return ResponseEntity.ok(new AuthResponse(jwt,
                userDetails.id(),
                userDetails.name(),
                userDetails.email(),
                roles.get(0).replace("ROLE_", "").toLowerCase()));
    }

//    @PostMapping("/refresh")
//    @Operation(
//            summary = "Refresh tokens",
//            description = "Generate new access and refresh tokens using a valid refresh token"
//    )
//    public ResponseEntity<AuthTokens> refresh(@Valid @RequestBody RefreshRequest request) {
//        AuthTokens tokens = authService.refresh(request);
//        return ResponseEntity.ok(tokens);
//    }

    @GetMapping("/me")
    @Operation(
            summary = "Get current user",
            description = "Get information about the currently authenticated user",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal String email) {
        UserDto user = authService.me(email);
        return ResponseEntity.ok(user);
    }
}
