package ru.doceum.modules.profile.domain.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class Favorite {
    private UUID userId;
    private UUID publicationId;
    private Instant createdAt;

    public static Favorite createNew(UUID userId, UUID publicationId) {
        return Favorite.builder()
                .userId(userId)
                .publicationId(publicationId)
                .createdAt(Instant.now())
                .build();
    }
}