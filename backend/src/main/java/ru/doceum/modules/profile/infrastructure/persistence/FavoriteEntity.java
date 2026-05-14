package ru.doceum.modules.profile.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.doceum.modules.profile.domain.models.Favorite;

import java.time.Instant;

@Entity
@Table(name = "favorites")
@Getter
@Setter
@NoArgsConstructor
public class FavoriteEntity {

    @EmbeddedId
    private FavoriteId id;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public static FavoriteEntity fromDomain(Favorite favorite) {
        FavoriteEntity entity = new FavoriteEntity();
        entity.setId(new FavoriteId(favorite.getUserId(), favorite.getPublicationId()));
        entity.setCreatedAt(favorite.getCreatedAt());
        return entity;
    }

    public Favorite toDomain() {
        return Favorite.builder()
                .userId(id.getUserId())
                .publicationId(id.getPublicationId())
                .createdAt(createdAt)
                .build();
    }
}