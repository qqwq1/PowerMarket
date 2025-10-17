package com.powermarket.app.service;

import com.powermarket.app.dto.LotDto;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LotService {
    private final List<LotDto> lots = new ArrayList<>();

    @PostConstruct
    public void init() {
        for (long i = 1; i <= 8; i++) {
            LotDto l = new LotDto();
            l.setId(i);
            l.setTitle("Станок #" + i);
            l.setDescription("Обработка металла. Точение, фрезеровка. Готов к аренде.");
            l.setCategory(i % 2 == 0 ? "Металлообработка" : "Печать 3D");
            l.setPrice(new BigDecimal("1500.00"));
            l.setUnit("₽/час");
            l.setCapacity("2 смены/сутки");
            l.setLocation(i % 2 == 0 ? "Екатеринбург" : "Москва");
            l.setContacts("+7-900-000-00-0" + i);
            lots.add(l);
        }
    }

    public List<LotDto> list(String query, String category, String location) {
        return lots.stream().filter(l ->
            (query == null || query.isBlank() || l.getTitle().toLowerCase().contains(query.toLowerCase()) || l.getDescription().toLowerCase().contains(query.toLowerCase())) &&
            (category == null || category.isBlank() || l.getCategory().equalsIgnoreCase(category)) &&
            (location == null || location.isBlank() || l.getLocation().equalsIgnoreCase(location))
        ).collect(Collectors.toList());
    }

    public Optional<LotDto> get(Long id) {
        return lots.stream().filter(l -> l.getId().equals(id)).findFirst();
    }
}