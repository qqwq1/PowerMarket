package org.dev.powermarket.service.signature.validation;

import lombok.extern.slf4j.Slf4j;
import org.dev.powermarket.domain.dto.response.SignatureValidationResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Component
@Order(ValidatorOrder.FILE_SIZE)
public class FileSizeValidator implements SignatureValidator {

    @Value("${signature.validation.max-size:5242880}") // 5MB по умолчанию
    private long maxFileSize;

    @Value("${signature.validation.min-size:100}") // 100 байт по умолчанию
    private long minFileSize;

    @Override
    public SignatureValidationResult validate(MultipartFile file) {
        long fileSize = file.getSize();

        if (fileSize < minFileSize) {
            String message = String.format(
                    "Файл слишком мал (%.2f KB). Минимальный размер: %.2f KB",
                    fileSize / 1024.0,
                    minFileSize / 1024.0
            );
            log.warn("File size validation failed: {}", message);
            return SignatureValidationResult.rejected(message);
        }

        if (fileSize > maxFileSize) {
            String message = String.format(
                    "Файл слишком велик (%.2f MB). Максимальный размер: %.2f MB",
                    fileSize / (1024.0 * 1024.0),
                    maxFileSize / (1024.0 * 1024.0)
            );
            log.warn("File size validation failed: {}", message);
            return SignatureValidationResult.rejected(message);
        }

        return SignatureValidationResult.valid();
    }
}