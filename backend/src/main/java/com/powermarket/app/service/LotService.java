package com.powermarket.app.service;

import com.powermarket.app.dto.CreateLotRequest;
import com.powermarket.app.dto.LotDto;
import com.powermarket.app.dto.UpdateLotRequest;
import com.powermarket.app.entity.Lot;
import com.powermarket.app.repository.LotRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LotService {
    
    private final LotRepository lotRepository;
    
    @Transactional(readOnly = true)
    public List<LotDto> list(String query, String category, String location) {
        Specification<Lot> spec = (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (query != null && !query.trim().isEmpty()) {
                String likePattern = "%" + query.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern)
                ));
            }
            
            if (category != null && !category.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }
            
            if (location != null && !location.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("location")), 
                    "%" + location.toLowerCase() + "%"
                ));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        return lotRepository.findAll(spec).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<LotDto> get(Long id) {
        return lotRepository.findById(id).map(this::toDto);
    }
    
    @Transactional
    public LotDto create(CreateLotRequest request, String executorSessionId) {
        Lot lot = new Lot();
        lot.setTitle(request.getTitle());
        lot.setDescription(request.getDescription());
        lot.setCategory(request.getCategory());
        lot.setPrice(request.getPrice());
        lot.setUnit(request.getUnit());
        lot.setCapacity(request.getCapacity());
        lot.setLocation(request.getLocation());
        lot.setContacts(request.getContacts());
        lot.setExecutorSessionId(executorSessionId);
        
        lot = lotRepository.save(lot);
        return toDto(lot);
    }
    
    @Transactional
    public Optional<LotDto> update(Long id, UpdateLotRequest request, String executorSessionId) {
        return lotRepository.findById(id)
                .filter(lot -> lot.getExecutorSessionId().equals(executorSessionId))
                .map(lot -> {
                    if (request.getTitle() != null) lot.setTitle(request.getTitle());
                    if (request.getDescription() != null) lot.setDescription(request.getDescription());
                    if (request.getCategory() != null) lot.setCategory(request.getCategory());
                    if (request.getPrice() != null) lot.setPrice(request.getPrice());
                    if (request.getUnit() != null) lot.setUnit(request.getUnit());
                    if (request.getCapacity() != null) lot.setCapacity(request.getCapacity());
                    if (request.getLocation() != null) lot.setLocation(request.getLocation());
                    if (request.getContacts() != null) lot.setContacts(request.getContacts());
                    
                    return toDto(lotRepository.save(lot));
                });
    }
    
    @Transactional
    public boolean delete(Long id, String executorSessionId) {
        return lotRepository.findById(id)
                .filter(lot -> lot.getExecutorSessionId().equals(executorSessionId))
                .map(lot -> {
                    lotRepository.delete(lot);
                    return true;
                })
                .orElse(false);
    }
    
    @Transactional(readOnly = true)
    public List<LotDto> getMyLots(String executorSessionId) {
        return lotRepository.findByExecutorSessionId(executorSessionId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    private LotDto toDto(Lot lot) {
        LotDto dto = new LotDto();
        dto.setId(lot.getId());
        dto.setTitle(lot.getTitle());
        dto.setDescription(lot.getDescription());
        dto.setCategory(lot.getCategory());
        dto.setPrice(lot.getPrice());
        dto.setUnit(lot.getUnit());
        dto.setCapacity(lot.getCapacity());
        dto.setLocation(lot.getLocation());
        dto.setContacts(lot.getContacts());
        dto.setCreatedAt(lot.getCreatedAt());
        dto.setUpdatedAt(lot.getUpdatedAt());
        return dto;
    }
}
