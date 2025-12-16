package org.dev.powermarket.exception;

public class PdfFileNotFoundException extends RuntimeException {
    public PdfFileNotFoundException(String message) {
        super(message);
    }
}