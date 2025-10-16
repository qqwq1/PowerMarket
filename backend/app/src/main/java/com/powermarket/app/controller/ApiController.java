package com.powermarket.app.controller;

import com.powermarket.app.dto.RoleSelectionRequest;
import com.powermarket.app.service.LotService;
import com.powermarket.app.dto.LotDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final LotService lotService;
    public ApiController(LotService lotService) { this.lotService = lotService; }

    @PostMapping("/session/role")
    public ResponseEntity<?> selectRole(@Valid @RequestBody RoleSelectionRequest req) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() { return ResponseEntity.ok().build(); }

    @GetMapping("/lots")
    public List<LotDto> list(@RequestParam(required = false) String q,
                             @RequestParam(required = false) String category,
                             @RequestParam(required = false) String location) {
        return lotService.list(q, category, location);
    }

    @GetMapping("/lots/{id}")
    public ResponseEntity<LotDto> get(@PathVariable Long id) {
        return lotService.get(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}