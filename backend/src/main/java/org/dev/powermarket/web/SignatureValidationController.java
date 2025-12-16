package org.dev.powermarket.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.dev.powermarket.domain.dto.response.SignatureValidationResult;
import org.dev.powermarket.repository.RentalRepository;
import org.dev.powermarket.service.signature.SignatureValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contracts")
@RequiredArgsConstructor
@Tag(name = "Электронные подписи", description = "API для проверки электронных подписей")
public class SignatureValidationController {

    private final SignatureValidationService signatureValidationService;

    @Operation(
            summary = "Проверить файл электронной подписи",
            description = "Проверяет файл электронной подписи на соответствие требованиям"
    )

    @ApiResponse(responseCode = "200", description = "Файл проверен")
    @ApiResponse(responseCode = "400", description = "Файл не прошёл проверку")
    @PostMapping(value = "/{rentalId}/signature", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SignatureValidationResult> validateSignature(
            @PathVariable UUID rentalId,
            @Parameter(description = "Файл электронной подписи (*.sig, *.p7s, *.xml, *.pdf)", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetails principal) {

        var email = principal.getUsername();
        SignatureValidationResult result = signatureValidationService.validate(email, rentalId, file);

        return ResponseEntity
                .status(result.validResult() ? HttpStatus.OK : HttpStatus.BAD_REQUEST)
                .body(result);
    }

}