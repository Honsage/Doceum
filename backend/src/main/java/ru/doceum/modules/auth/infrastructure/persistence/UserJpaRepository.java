package ru.doceum.modules.auth.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserJpaRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmail(String email);
    @Query("SELECT u FROM UserEntity u WHERE " +
            "LOWER(CONCAT(u.surname, ' ', u.name, COALESCE(CONCAT(' ', u.patronymic), ''))) " +
            "LIKE LOWER(CONCAT('%', :query, '%'))")
    List<UserEntity> findByFullNameContaining(@Param("query") String query);
    boolean existsByEmail(String email);
}