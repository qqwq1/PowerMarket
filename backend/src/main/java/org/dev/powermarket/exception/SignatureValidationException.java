package org.dev.powermarket.exception;

public class SignatureValidationException extends RuntimeException {
    public SignatureValidationException(String message) {
        super(message);
    }
}
