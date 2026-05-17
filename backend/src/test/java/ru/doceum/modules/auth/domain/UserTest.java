package ru.doceum.modules.auth.domain;

import org.junit.jupiter.api.Test;
import ru.doceum.modules.auth.domain.models.User;
import ru.doceum.modules.auth.domain.models.UserRole;
import ru.doceum.modules.auth.domain.valueobjects.Email;
import ru.doceum.modules.auth.domain.valueobjects.Password;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void testUserCreation() {
        UUID id = UUID.randomUUID();
        Email email = new Email("test@example.com");
        Password password = new Password("hashedPassword");
        UserRole role = UserRole.READER;

        User user = new User(
                id, email, password, role,
                "Test", "User", "Testovich",
                "TestOrg", "Tester",
                Instant.now(), null
        );

        assertEquals(id, user.getId());
        assertEquals(email, user.getEmail());
        assertEquals(password, user.getPassword());
        assertEquals(role, user.getRole());
        assertEquals("Test", user.getSurname());
        assertEquals("User", user.getName());
        assertEquals("Testovich", user.getPatronymic());
        assertEquals("TestOrg", user.getOrganization());
        assertEquals("Tester", user.getPosition());
    }

    @Test
    void testUserRegister() {
        Email email = new Email("test@example.com");
        Password password = new Password("hashedPassword");
        UserRole role = UserRole.AUTHOR;

        User user = User.register(
                email, password, role,
                "Test", "User", "Testovich",
                "TestOrg", "Tester"
        );

        assertNotNull(user.getId());
        assertEquals(email, user.getEmail());
        assertEquals(role, user.getRole());
        assertNotNull(user.getCreatedAt());
        assertNull(user.getLastLoginAt());
    }

    @Test
    void testUpdateLastLogin() {
        User user = createTestUser();
        assertNull(user.getLastLoginAt());

        user.updateLastLogin();

        assertNotNull(user.getLastLoginAt());
    }

    @Test
    void testChangePassword() {
        User user = createTestUser();
        Password newPassword = new Password("newHashedPassword");

        user.changePassword(newPassword);

        assertEquals(newPassword, user.getPassword());
    }

    private User createTestUser() {
        return User.register(
                new Email("test@example.com"),
                new Password("hashedPassword"),
                UserRole.READER,
                "Test", "User", null, null, null
        );
    }
}