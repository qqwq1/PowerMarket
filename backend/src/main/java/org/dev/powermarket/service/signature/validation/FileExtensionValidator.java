package org.dev.powermarket.service.signature.validation;

import lombok.extern.slf4j.Slf4j;
import org.dev.powermarket.domain.dto.response.SignatureValidationResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
@Order(ValidatorOrder.EXTENSION)
public class FileExtensionValidator implements SignatureValidator {

    @Value("${signature.validation.allowed-extensions:sig,p7s,xml,pdf}")
    private String allowedExtensionsConfig;

    private Set<String> allowedExtensions;

    @Override
    public SignatureValidationResult validate(MultipartFile file) {
        String filename = file.getOriginalFilename();

        if (filename == null || filename.lastIndexOf('.') == -1) {
            log.warn("File has no extension: {}", filename);
            return SignatureValidationResult.rejected("Файл не имеет расширения");
        }

        String extension = getFileExtension(filename);

        if (!getAllowedExtensions().contains(extension)) {
            String message = String.format(
                    "Недопустимое расширение файла: .%s. Разрешённые: %s",
                    extension,
                    getAllowedExtensions().stream()
                            .map(ext -> "." + ext)
                            .collect(Collectors.joining(", "))
            );
            log.warn("File extension validation failed: {}", message);
            return SignatureValidationResult.rejected(message);
        }

        return SignatureValidationResult.valid();
    }

    private String getFileExtension(String filename) {
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private Set<String> getAllowedExtensions() {
        if (allowedExtensions == null) {
            allowedExtensions = Arrays.stream(allowedExtensionsConfig.split(","))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet());
        }
        return allowedExtensions;
    }
}