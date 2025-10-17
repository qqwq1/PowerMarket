package com.powermarket.app.controller;

import com.powermarket.app.service.LotService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ViewController {
    private final LotService lotService;
    public ViewController(LotService lotService) { this.lotService = lotService; }

    @GetMapping("/")
    public String placementForm() { return "placement-form"; }

    @GetMapping("/catalog")
    public String catalog(@RequestParam(value = "q", required = false) String q,
                          @RequestParam(value = "category", required = false) String category,
                          @RequestParam(value = "location", required = false) String location,
                          Model model) {
        model.addAttribute("lots", lotService.list(q, category, location));
        model.addAttribute("q", q == null ? "" : q);
        model.addAttribute("category", category == null ? "" : category);
        model.addAttribute("location", location == null ? "" : location);
        return "catalog";
    }

    @GetMapping("/lots/{id}")
    public String lotCard(@PathVariable Long id, Model model) {
        model.addAttribute("lot", lotService.get(id).orElse(null));
        return "lot-card";
    }

    @GetMapping("/logout")
    public String logoutRedirect() { return "redirect:/"; }
}