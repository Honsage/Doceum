package ru.doceum.modules.profile.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoriteJpaRepository extends JpaRepository<FavoriteEntity, UUID> {
    List<FavoriteEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<FavoriteEntity> findByUserIdAndPublicationId(UUID userId, UUID publicationId);
    boolean existsByUserIdAndPublicationId(UUID userId, UUID publicationId);
    int countByUserId(UUID userId);
}