package ru.doceum.modules.profile;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import ru.doceum.common.ports.documents.DocumentPort;
import ru.doceum.modules.profile.application.services.ProfileApplicationService;
import ru.doceum.modules.profile.domain.repositories.FavoriteRepository;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class ProfileServiceTest {

    @Autowired
    private ProfileApplicationService profileService;

    @MockBean
    private DocumentPort documentPort;

    @MockBean
    private FavoriteRepository favoriteRepository;

    private UUID userId;
    private UUID publicationId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        publicationId = UUID.randomUUID();
    }

    @Test
    void testAddToFavoritesSuccess() {
        when(documentPort.existsPublished(publicationId)).thenReturn(true);
        when(favoriteRepository.existsByUserIdAndPublicationId(userId, publicationId))
                .thenReturn(false);

        assertDoesNotThrow(() -> profileService.addToFavorites(userId, publicationId));
    }

    @Test
    void testAddToFavoritesPublicationNotFound() {
        when(documentPort.existsPublished(publicationId)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> profileService.addToFavorites(userId, publicationId));

        assertEquals("Publication not found or not published", exception.getMessage());
    }

    @Test
    void testAddToFavoritesAlreadyExists() {
        when(documentPort.existsPublished(publicationId)).thenReturn(true);
        when(favoriteRepository.existsByUserIdAndPublicationId(userId, publicationId))
                .thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> profileService.addToFavorites(userId, publicationId));

        assertEquals("Already in favorites", exception.getMessage());
    }

    @Test
    void testRemoveFromFavoritesSuccess() {
        ru.doceum.modules.profile.domain.models.Favorite favorite =
                ru.doceum.modules.profile.domain.models.Favorite.createNew(userId, publicationId);

        when(favoriteRepository.findByUserIdAndPublicationId(userId, publicationId))
                .thenReturn(Optional.of(favorite));

        assertDoesNotThrow(() -> profileService.removeFromFavorites(userId, publicationId));
    }

    @Test
    void testRemoveFromFavoritesNotFound() {
        when(favoriteRepository.findByUserIdAndPublicationId(userId, publicationId))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> profileService.removeFromFavorites(userId, publicationId));

        assertEquals("Favorite not found", exception.getMessage());
    }
}