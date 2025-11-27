package ru.leshchev.exportService.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.leshchev.exportService.dto.LotDTO;
import ru.leshchev.exportService.models.Lot;
import ru.leshchev.exportService.service.LotService;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/service")
public class LotController {

    private final LotService servicesService;

    @Autowired
    public LotController(LotService servicesService) {
        this.servicesService = servicesService;
    }
    @GetMapping
    public List<LotDTO> getAll() {
        return servicesService.getAll();
    }

    @GetMapping("/{id}")
    public List<LotDTO> getAllSupplierLots(@PathVariable UUID id) {
        return servicesService.getAllSupplierLots(id);
    }

    @GetMapping("/export/{id}")
    public ResponseEntity<byte[]> exportData(@PathVariable UUID id) throws IOException {
        byte[] excel = servicesService.exportDataToExcel(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=myLots.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }
}
