package ru.doceum.modules.auth.domain.valueobjects;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmailTest {

    @Test
    void testValidEmail() {
        Email email = new Email("user@example.com");
        assertEquals("user@example.com", email.value());
    }

    @Test
    void testEmailWithDot() {
        Email email = new Email("user.name@example.co.uk");
        assertEquals("user.name@example.co.uk", email.value());
    }

    @Test
    void testEmailWithPlus() {
        Email email = new Email("user+tag@example.com");
        assertEquals("user+tag@example.com", email.value());
    }

    @Test
    void testNullEmailThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> new Email(null));
    }

    @Test
    void testEmptyEmailThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> new Email(""));
    }

    @Test
    void testBlankEmailThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> new Email("   "));
    }

    @Test
    void testInvalidEmailMissingAt() {
        assertThrows(IllegalArgumentException.class, () -> new Email("userexample.com"));
    }

    @Test
    void testInvalidEmailMissingDomain() {
        assertThrows(IllegalArgumentException.class, () -> new Email("user@"));
    }

    @Test
    void testInvalidEmailMissingLocal() {
        assertThrows(IllegalArgumentException.class, () -> new Email("@example.com"));
    }
}