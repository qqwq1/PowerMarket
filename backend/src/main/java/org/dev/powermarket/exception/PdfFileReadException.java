package org.dev.powermarket.exception;

public class PdfFileReadException extends RuntimeException {
    public PdfFileReadException(String message, Exception e) {
        super(message,e);
    }
}
