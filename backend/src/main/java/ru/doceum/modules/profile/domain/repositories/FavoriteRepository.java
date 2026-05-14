package ru.doceum.modules.profile.domain.repositories;

import ru.doceum.modules.profile.domain.models.Favorite;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoriteRepository {
    Favorite save(Favorite favorite);
    Optional<Favorite> findByUserIdAndPublicationId(UUID userId, UUID publicationId);
    List<Favorite> findByUserIdOrderByCreatedAtDesc(UUID userId);
    void delete(Favorite favorite);
    boolean existsByUserIdAndPublicationId(UUID userId, UUID publicationId);
    int countByUserId(UUID userId);
}