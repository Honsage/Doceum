package ru.doceum.modules.auth.infrastructure.persistence;

import ru.doceum.modules.auth.domain.models.User;
import ru.doceum.modules.auth.domain.repositories.UserRepository;
import ru.doceum.modules.auth.domain.valueobjects.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final UserJpaRepository jpaRepository;

    @Override
    public User save(User user) {
        UserEntity entity = UserEntity.fromDomain(user);
        return jpaRepository.save(entity).toDomain();
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return jpaRepository.findByEmail(email.value())
                .map(UserEntity::toDomain);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(UserEntity::toDomain);
    }

    @Override
    public boolean existsByEmail(Email email) {
        return jpaRepository.existsByEmail(email.value());
    }

    @Override
    public void delete(User user) {
        jpaRepository.deleteById(user.getId());
    }
}