package ru.doceum.modules.auth.domain.valueobjects;

public record Password(String hashedValue) {
    public Password {
        if (hashedValue == null || hashedValue.isBlank()) {
            throw new IllegalArgumentException("Password hash cannot be empty");
        }
    }
}