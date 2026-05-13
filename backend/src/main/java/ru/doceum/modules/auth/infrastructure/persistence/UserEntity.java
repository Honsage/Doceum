package ru.doceum.modules.auth.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
public class UserEntity {

    @Id
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRoleEntity role;

    @Column(nullable = false)
    private String surname;

    @Column(nullable = false)
    private String name;

    private String patronymic;
    private String organization;
    private String position;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant lastLoginAt;

    public static UserEntity fromDomain(ru.doceum.modules.auth.domain.models.User user) {
        UserEntity entity = new UserEntity();
        entity.setId(user.getId());
        entity.setEmail(user.getEmail().value());
        entity.setPasswordHash(user.getPassword().hashedValue());
        entity.setRole(UserRoleEntity.valueOf(user.getRole().name()));
        entity.setSurname(user.getSurname());
        entity.setName(user.getName());
        entity.setPatronymic(user.getPatronymic());
        entity.setOrganization(user.getOrganization());
        entity.setPosition(user.getPosition());
        entity.setCreatedAt(user.getCreatedAt());
        entity.setLastLoginAt(user.getLastLoginAt());
        return entity;
    }

    public ru.doceum.modules.auth.domain.models.User toDomain() {
        return new ru.doceum.modules.auth.domain.models.User(
                id,
                new ru.doceum.modules.auth.domain.valueobjects.Email(email),
                new ru.doceum.modules.auth.domain.valueobjects.Password(passwordHash),
                ru.doceum.modules.auth.domain.models.UserRole.valueOf(role.name()),
                surname, name, patronymic, organization, position,
                createdAt, lastLoginAt
        );
    }
}