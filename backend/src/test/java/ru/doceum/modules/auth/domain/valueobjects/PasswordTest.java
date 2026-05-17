package ru.doceum.modules.auth.domain.valueobjects;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordTest {

    @Test
    void testValidPassword() {
        Password password = new Password("hashedPassword123");
        assertEquals("hashedPassword123", password.hashedValue());
    }

    @Test
    void testNullPasswordThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> new Password(null));
    }

    @Test
    void testEmptyPasswordThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> new Password(""));
    }

    @Test
    void testBlankPasswordThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> new Password("   "));
    }
}