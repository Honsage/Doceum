package ru.doceum.modules.auth.domain.repositories;

import ru.doceum.modules.auth.domain.models.User;
import ru.doceum.modules.auth.domain.valueobjects.Email;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository {
    User save(User user);
    Optional<User> findByEmail(Email email);
    Optional<User> findById(UUID id);
    boolean existsByEmail(Email email);
    void delete(User user);
}