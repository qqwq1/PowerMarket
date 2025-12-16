package org.dev.powermarket.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(PdfFileNotFoundException.class)
    public ResponseEntity<Map<String, String>> handlePdfNotFound(PdfFileNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "File Not Found");
        error.put("message", ex.getMessage());
        log.warn(ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(PdfFileReadException.class)
    public ResponseEntity<Map<String, String>> handlePdfRead(PdfFileReadException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "File Read Error");
        error.put("message", ex.getMessage());
        log.warn(ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Maximum upload size exceeded");
        log.warn("Maximum upload size exceeded");
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(error);
    }

    @ExceptionHandler(RentalNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleRentalNotFound(RentalNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Rental Not Found");
        error.put("message", ex.getMessage());
        log.warn(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
