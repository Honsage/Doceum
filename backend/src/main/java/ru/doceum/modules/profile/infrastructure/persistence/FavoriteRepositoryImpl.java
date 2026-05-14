package ru.doceum.modules.profile.infrastructure.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.doceum.modules.profile.domain.models.Favorite;
import ru.doceum.modules.profile.domain.repositories.FavoriteRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class FavoriteRepositoryImpl implements FavoriteRepository {

    private final FavoriteJpaRepository jpaRepository;

    @Override
    public Favorite save(Favorite favorite) {
        FavoriteEntity entity = FavoriteEntity.fromDomain(favorite);
        return jpaRepository.save(entity).toDomain();
    }

    @Override
    public Optional<Favorite> findByUserIdAndPublicationId(UUID userId, UUID publicationId) {
        return jpaRepository.findByIdUserIdAndIdPublicationId(userId, publicationId)
                .map(FavoriteEntity::toDomain);
    }

    @Override
    public List<Favorite> findByUserIdOrderByCreatedAtDesc(UUID userId) {
        return jpaRepository.findByIdUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(FavoriteEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Favorite favorite) {
        FavoriteId id = new FavoriteId(favorite.getUserId(), favorite.getPublicationId());
        jpaRepository.deleteById(id);
    }

    @Override
    public boolean existsByUserIdAndPublicationId(UUID userId, UUID publicationId) {
        return jpaRepository.existsByIdUserIdAndIdPublicationId(userId, publicationId);
    }

    @Override
    public int countByUserId(UUID userId) {
        return jpaRepository.countByUserId(userId);
    }
}