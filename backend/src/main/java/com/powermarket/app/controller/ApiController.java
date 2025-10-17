package com.powermarket.app.controller;

import com.powermarket.app.dto.*;
import com.powermarket.app.entity.UserRole;
import com.powermarket.app.service.LotService;
import com.powermarket.app.service.SessionService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ApiController {
    
    private final LotService lotService;
    private final SessionService sessionService;
    
    // Session Management
    
    @PostMapping("/session/role")
    public ResponseEntity<RoleSelectionResponse> selectRole(
            @Valid @RequestBody RoleSelectionRequest request,
            HttpSession session) {
        
        UserRole role = UserRole.valueOf(request.getRole());
        sessionService.setRole(session, role);
        
        return ResponseEntity.ok(new RoleSelectionResponse(
                role.name(),
                session.getId(),
                "Role selected successfully"
        ));
    }
    
    @GetMapping("/session/role")
    public ResponseEntity<RoleSelectionResponse> getRole(HttpSession session) {
        return sessionService.getRole(session)
                .map(role -> ResponseEntity.ok(new RoleSelectionResponse(
                        role.name(),
                        session.getId(),
                        "Role retrieved successfully"
                )))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new RoleSelectionResponse(null, null, "No role selected")));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        sessionService.clearRole(session);
        session.invalidate();
        return ResponseEntity.ok().build();
    }
    
    // Catalog - Available for both roles
    
    @GetMapping("/lots")
    public ResponseEntity<List<LotDto>> listLots(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location) {
        
        return ResponseEntity.ok(lotService.list(q, category, location));
    }
    
    @GetMapping("/lots/{id}")
    public ResponseEntity<LotDto> getLot(@PathVariable Long id) {
        return lotService.get(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Executor-only endpoints
    
    @GetMapping("/executor/lots")
    public ResponseEntity<?> getMyLots(HttpSession session) {
        return sessionService.getRole(session)
                .filter(role -> role == UserRole.EXECUTOR)
                .map(role -> ResponseEntity.ok(lotService.getMyLots(session.getId())))
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse(403, "Forbidden", "Only executors can access this endpoint")));
    }
    
    @PostMapping("/executor/lots")
    public ResponseEntity<?> createLot(
            @Valid @RequestBody CreateLotRequest request,
            HttpSession session) {
        
        return sessionService.getRole(session)
                .filter(role -> role == UserRole.EXECUTOR)
                .map(role -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(lotService.create(request, session.getId())))
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse(403, "Forbidden", "Only executors can create lots")));
    }
    
    @PutMapping("/executor/lots/{id}")
    public ResponseEntity<?> updateLot(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLotRequest request,
            HttpSession session) {
        
        return sessionService.getRole(session)
                .filter(role -> role == UserRole.EXECUTOR)
                .flatMap(role -> lotService.update(id, request, session.getId())
                        .map(ResponseEntity::ok))
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse(403, "Forbidden", "Only executors can update their lots")));
    }
    
    @DeleteMapping("/executor/lots/{id}")
    public ResponseEntity<?> deleteLot(@PathVariable Long id, HttpSession session) {
        return sessionService.getRole(session)
                .filter(role -> role == UserRole.EXECUTOR)
                .map(role -> {
                    boolean deleted = lotService.delete(id, session.getId());
                    if (deleted) {
                        return ResponseEntity.noContent().build();
                    }
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ErrorResponse(404, "Not Found", "Lot not found or not owned by executor"));
                })
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse(403, "Forbidden", "Only executors can delete their lots")));
    }
}
