package ru.doceum.modules.auth.domain.models;

import ru.doceum.modules.auth.domain.valueobjects.Email;
import ru.doceum.modules.auth.domain.valueobjects.Password;
import java.time.Instant;
import java.util.UUID;

public class User {
    private final UUID id;
    private final Email email;
    private Password password;
    private final UserRole role;
    private final String surname;
    private final String name;
    private final String patronymic;
    private final String organization;
    private final String position;
    private final Instant createdAt;
    private Instant lastLoginAt;

    public User(UUID id, Email email, Password password, UserRole role,
                String surname, String name, String patronymic,
                String organization, String position,
                Instant createdAt, Instant lastLoginAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.surname = surname;
        this.name = name;
        this.patronymic = patronymic;
        this.organization = organization;
        this.position = position;
        this.createdAt = createdAt;
        this.lastLoginAt = lastLoginAt;
    }

    // Factory method для нового пользователя
    public static User register(Email email, Password hashedPassword, UserRole role,
                                String surname, String name, String patronymic,
                                String organization, String position) {
        return new User(
                UUID.randomUUID(),
                email,
                hashedPassword,
                role,
                surname,
                name,
                patronymic,
                organization,
                position,
                Instant.now(),
                null
        );
    }

    public void updateLastLogin() {
        this.lastLoginAt = Instant.now();
    }

    public void changePassword(Password newPassword) {
        this.password = newPassword;
    }

    // Getters
    public UUID getId() { return id; }
    public Email getEmail() { return email; }
    public Password getPassword() { return password; }
    public UserRole getRole() { return role; }
    public String getSurname() { return surname; }
    public String getName() { return name; }
    public String getPatronymic() { return patronymic; }
    public String getOrganization() { return organization; }
    public String getPosition() { return position; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastLoginAt() { return lastLoginAt; }
}