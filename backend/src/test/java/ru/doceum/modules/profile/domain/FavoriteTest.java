package ru.doceum.modules.profile.domain;

import org.junit.jupiter.api.Test;
import ru.doceum.modules.profile.domain.models.Favorite;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class FavoriteTest {

    @Test
    void testCreateFavorite() {
        UUID userId = UUID.randomUUID();
        UUID publicationId = UUID.randomUUID();

        Favorite favorite = Favorite.createNew(userId, publicationId);

        assertEquals(userId, favorite.getUserId());
        assertEquals(publicationId, favorite.getPublicationId());
        assertNotNull(favorite.getCreatedAt());
    }

    @Test
    void testFavoriteBuilder() {
        UUID userId = UUID.randomUUID();
        UUID publicationId = UUID.randomUUID();

        Favorite favorite = Favorite.builder()
                .userId(userId)
                .publicationId(publicationId)
                .createdAt(java.time.Instant.now())
                .build();

        assertEquals(userId, favorite.getUserId());
        assertEquals(publicationId, favorite.getPublicationId());
    }
}