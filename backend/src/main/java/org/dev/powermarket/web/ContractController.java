package org.dev.powermarket.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dev.powermarket.domain.dto.response.ContractStatusDto;
import org.dev.powermarket.exception.PdfFileNotFoundException;
import org.dev.powermarket.service.ContractService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.UUID;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/contracts")
public class ContractController {

    private final ContractService contractService;
    private final ContractService contractStatusService;

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getContract(@PathVariable String filename) {
        Resource pdfFile = contractService.getPdfFile(filename);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filename + "\"")
                .body(pdfFile);


    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadContract(@PathVariable String filename) {

        Resource pdfFile = contractService.getPdfFile(filename);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(pdfFile);
    }

    @Operation(
            summary = "Получить статус контракта",
            description = "Возвращает статус подписания контракта по ID запроса на аренду"
    )
    @ApiResponse(responseCode = "200", description = "Статус контракта получен")
    @ApiResponse(responseCode = "404", description = "Аренда с указанным ID не найдена")
    @GetMapping("/{rentalId}/status")
    public ResponseEntity<ContractStatusDto> getContractStatus(
            @Parameter(description = "ID запроса на аренду", required = true, example = "123e4567-e89b-12d3-a456-426614174000")
            @PathVariable UUID rentalId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetails principal) {


        ContractStatusDto status = contractStatusService.getContractStatus(principal.getUsername(),rentalId);
        return ResponseEntity.ok(status);
    }
}
