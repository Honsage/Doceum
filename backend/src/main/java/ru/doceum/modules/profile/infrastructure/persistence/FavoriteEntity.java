package ru.doceum.modules.profile.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.doceum.modules.profile.domain.models.Favorite;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "favorites")
@Getter
@Setter
@NoArgsConstructor
public class FavoriteEntity {

    @Id
    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;

    @Id
    @Column(name = "publication_id", columnDefinition = "UUID")
    private UUID publicationId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public static FavoriteEntity fromDomain(Favorite favorite) {
        FavoriteEntity entity = new FavoriteEntity();
        entity.setUserId(favorite.getUserId());
        entity.setPublicationId(favorite.getPublicationId());
        entity.setCreatedAt(favorite.getCreatedAt());
        return entity;
    }

    public Favorite toDomain() {
        return Favorite.builder()
                .userId(userId)
                .publicationId(publicationId)
                .createdAt(createdAt)
                .build();
    }
}