package ru.doceum.modules.profile.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoriteJpaRepository extends JpaRepository<FavoriteEntity, FavoriteId> {

    // Доступ к полям через id.userId и id.publicationId
    List<FavoriteEntity> findByIdUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<FavoriteEntity> findByIdUserIdAndIdPublicationId(UUID userId, UUID publicationId);

    boolean existsByIdUserIdAndIdPublicationId(UUID userId, UUID publicationId);

    @Query("SELECT COUNT(f) FROM FavoriteEntity f WHERE f.id.userId = :userId")
    int countByUserId(@Param("userId") UUID userId);
}