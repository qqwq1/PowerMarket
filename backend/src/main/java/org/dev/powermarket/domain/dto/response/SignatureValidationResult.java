package org.dev.powermarket.domain.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;


@JsonInclude(JsonInclude.Include.NON_NULL)
public record SignatureValidationResult(
        boolean validResult,
        String message,
        LocalDateTime timestamp,
        String filename,
        Long fileSize,
        String fileType
) {

    public static SignatureValidationResult accepted(String filename, Long fileSize, String fileType) {
        return new SignatureValidationResult(
                true,
                "Файл успешно проверен и принят",
                LocalDateTime.now(),
                filename,
                fileSize,
                fileType
        );
    }

    public static SignatureValidationResult rejected(String reason) {
        return new SignatureValidationResult(
                false,
                reason,
                LocalDateTime.now(),
                null,
                null,
                null
        );
    }

    public static SignatureValidationResult valid() {
        return new SignatureValidationResult(
                true,
                null,
                null,
                null,
                null,
                null
        );
    }
}
