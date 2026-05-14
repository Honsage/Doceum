package ru.doceum.modules.profile.application.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.doceum.common.ports.auth.UserInfo;
import ru.doceum.common.ports.auth.UserPort;
import ru.doceum.common.ports.documents.DocumentMetadata;
import ru.doceum.common.ports.documents.DocumentPort;
import ru.doceum.modules.profile.application.dto.*;
import ru.doceum.modules.profile.domain.models.Favorite;
import ru.doceum.modules.profile.domain.repositories.FavoriteRepository;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileApplicationService {

    private final FavoriteRepository favoriteRepository;
    private final DocumentPort documentPort;
    private final UserPort userPort;

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 100;

    // === Избранное ===

    @Transactional(readOnly = true)
    public ProfileResponse<FavoriteItemResponse> getFavorites(UUID userId, int limit, int offset) {
        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);

        // Преобразуем в DTO с проверкой существования публикации
        List<FavoriteItemResponse> items = favorites.stream()
                .filter(fav -> documentPort.existsPublished(fav.getPublicationId()))
                .map(this::toFavoriteItemResponse)
                .collect(Collectors.toList());

        return buildResponse(items, limit, offset);
    }

    @Transactional
    public void addToFavorites(UUID userId, UUID publicationId) {
        // Проверяем, что публикация существует
        if (!documentPort.existsPublished(publicationId)) {
            throw new RuntimeException("Publication not found or not published");
        }

        // Проверяем, не добавлено ли уже
        if (favoriteRepository.existsByUserIdAndPublicationId(userId, publicationId)) {
            throw new RuntimeException("Already in favorites");
        }

        Favorite favorite = Favorite.createNew(userId, publicationId);
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFromFavorites(UUID userId, UUID publicationId) {
        Favorite favorite = favoriteRepository.findByUserIdAndPublicationId(userId, publicationId)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));
        favoriteRepository.delete(favorite);
    }

    // === Черновики автора ===

    @Transactional(readOnly = true)
    public ProfileResponse<DraftItemResponse> getDrafts(UUID authorId, int limit, int offset) {
        List<DocumentMetadata> drafts = documentPort.getDocumentsByAuthorIdAndStatus(authorId, "NOT_PUBLISHED");

        // Сортируем по updatedAt DESC
        List<DraftItemResponse> items = drafts.stream()
                .sorted(Comparator.comparing(DocumentMetadata::updatedAt, Comparator.reverseOrder()))
                .map(this::toDraftItemResponse)
                .collect(Collectors.toList());

        return buildResponse(items, limit, offset);
    }

    // === Опубликованные документы автора ===

    @Transactional(readOnly = true)
    public ProfileResponse<PublishedItemResponse> getPublishedDocuments(UUID authorId, int limit, int offset) {
        List<DocumentMetadata> published = documentPort.getDocumentsByAuthorIdAndStatus(authorId, "PUBLISHED");

        // Сортируем по publishedAt DESC
        List<PublishedItemResponse> items = published.stream()
                .filter(doc -> doc.publishedAt() != null)
                .sorted(Comparator.comparing(DocumentMetadata::publishedAt, Comparator.reverseOrder()))
                .map(this::toPublishedItemResponse)
                .collect(Collectors.toList());

        return buildResponse(items, limit, offset);
    }

    // === Преобразования ===

    private FavoriteItemResponse toFavoriteItemResponse(Favorite favorite) {
        DocumentMetadata metadata = documentPort.getMetadata(favorite.getPublicationId());
        UserInfo author = userPort.getUserInfo(metadata.authorId()).orElse(null);

        return new FavoriteItemResponse(
                favorite.getPublicationId().toString(),
                metadata.id().toString(),
                metadata.title(),
                metadata.description(),
                new AuthorInfoResponse(
                        author != null ? author.id().toString() : metadata.authorId().toString(),
                        author != null ? author.fullName() : "Unknown"
                ),
                metadata.publishedAt(),
                favorite.getCreatedAt().toString()
        );
    }

    private DraftItemResponse toDraftItemResponse(DocumentMetadata metadata) {
        return new DraftItemResponse(
                metadata.id().toString(),
                metadata.title(),
                metadata.description(),
                metadata.status(),
                metadata.updatedAt(),
                null // createdAt в DocumentMetadata пока нет, добавим позже
        );
    }

    private PublishedItemResponse toPublishedItemResponse(DocumentMetadata metadata) {
        return new PublishedItemResponse(
                metadata.id().toString(),
                metadata.title(),
                metadata.description(),
                metadata.status(),
                metadata.publishedAt(),
                metadata.updatedAt(),
                null // createdAt
        );
    }

    // === Пагинация ===

    private <T> ProfileResponse<T> buildResponse(List<T> items, int limit, int offset) {
        int validLimit = Math.min(limit > 0 ? limit : DEFAULT_LIMIT, MAX_LIMIT);
        int validOffset = Math.max(offset, 0);

        int total = items.size();
        int fromIndex = Math.min(validOffset, total);
        int toIndex = Math.min(validOffset + validLimit, total);

        List<T> paged = items.subList(fromIndex, toIndex);

        Integer nextOffset = toIndex < total ? toIndex : null;

        return new ProfileResponse<>(
                paged,
                new PaginationInfo(total, validLimit, validOffset, nextOffset)
        );
    }
}