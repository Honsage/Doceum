package ru.doceum.modules.auth.infrastructure.persistence;

import ru.doceum.modules.auth.domain.models.User;
import ru.doceum.modules.auth.domain.repositories.UserRepository;
import ru.doceum.modules.auth.domain.valueobjects.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

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
    public List<User> findByFullNameContaining(String query) {
        return jpaRepository.findByFullNameContaining(query)
                .stream()
                .map(UserEntity::toDomain)
                .collect(Collectors.toList());
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