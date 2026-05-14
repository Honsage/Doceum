package ru.doceum.modules.hub.application.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.doceum.common.ports.auth.UserInfo;
import ru.doceum.common.ports.auth.UserPort;
import ru.doceum.common.ports.documents.DocumentMetadata;
import ru.doceum.common.ports.documents.DocumentPort;
import ru.doceum.modules.hub.application.dto.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HubApplicationService {

    private final DocumentPort documentPort;
    private final UserPort userPort;

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 100;

    // Получить список последних публикаций
    public SearchResponse getRecentDocuments(int limit, int offset) {
        List<DocumentMetadata> allPublished = documentPort.getAllPublishedDocuments();

        // Сортируем по дате публикации (свежие сверху)
        List<DocumentMetadata> sorted = allPublished.stream()
                .sorted(Comparator.comparing(DocumentMetadata::publishedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        return buildResponse(sorted, limit, offset);
    }

    // Поиск по названию
    public SearchResponse searchByTitle(String query, int limit, int offset) {
        List<DocumentMetadata> allPublished = documentPort.getAllPublishedDocuments();

        // Фильтруем по названию (регистронезависимо)
        List<DocumentMetadata> filtered = allPublished.stream()
                .filter(doc -> doc.title().toLowerCase().contains(query.toLowerCase()))
                .sorted(Comparator.comparing(DocumentMetadata::publishedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        return buildResponse(filtered, limit, offset);
    }

    // Поиск по автору
    public SearchResponse searchByAuthor(String query, int limit, int offset) {
        // 1. Ищем пользователей по имени
        List<UserInfo> users = userPort.findUsersByFullNameLike(query);

        if (users.isEmpty()) {
            return new SearchResponse(List.of(), new PaginationInfo(0, limit, offset, null));
        }

        List<UUID> userIds = users.stream()
                .map(UserInfo::id)
                .collect(Collectors.toList());

        // 2. Получаем документы каждого найденного автора
        List<DocumentMetadata> allDocuments = userIds.stream()
                .flatMap(userId -> documentPort.getPublishedDocumentsByAuthorId(userId).stream())
                .sorted(Comparator.comparing(DocumentMetadata::publishedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        return buildResponse(allDocuments, limit, offset);
    }

    // Получить карточку документа по ID
    public DocumentCardResponse getDocumentCard(UUID documentId) {
        DocumentMetadata metadata = documentPort.getMetadata(documentId);

        // Проверяем, что документ опубликован
        if (!"PUBLISHED".equals(metadata.status())) {
            throw new RuntimeException("Document not published");
        }

        // Получаем информацию об авторе
        UserInfo author = userPort.getUserInfo(metadata.authorId())
                .orElseThrow(() -> new RuntimeException("Author not found"));

        return new DocumentCardResponse(
                metadata.id().toString(),
                metadata.title(),
                metadata.description(),
                new AuthorInfoResponse(author.id().toString(), author.fullName()),
                metadata.publishedAt(),
                metadata.updatedAt(),
                metadata.contentSha256(),
                metadata.hasSignature()
        );
    }

    // Построение ответа с пагинацией
    private SearchResponse buildResponse(List<DocumentMetadata> documents, int limit, int offset) {
        // Валидация параметров
        int validLimit = Math.min(limit > 0 ? limit : DEFAULT_LIMIT, MAX_LIMIT);
        int validOffset = Math.max(offset, 0);

        // Пагинация
        int total = documents.size();
        int fromIndex = Math.min(validOffset, total);
        int toIndex = Math.min(validOffset + validLimit, total);

        List<DocumentMetadata> paged = documents.subList(fromIndex, toIndex);

        // Преобразуем в DTO
        List<DocumentCardResponse> items = paged.stream()
                .map(this::toCardResponse)
                .collect(Collectors.toList());

        Integer nextOffset = toIndex < total ? toIndex : null;

        return new SearchResponse(
                items,
                new PaginationInfo(total, validLimit, validOffset, nextOffset)
        );
    }

    // Преобразование метаданных в карточку
    private DocumentCardResponse toCardResponse(DocumentMetadata metadata) {
        UserInfo author = userPort.getUserInfo(metadata.authorId())
                .orElse(null);

        return new DocumentCardResponse(
                metadata.id().toString(),
                metadata.title(),
                metadata.description(),
                author != null
                        ? new AuthorInfoResponse(author.id().toString(), author.fullName())
                        : new AuthorInfoResponse(metadata.authorId().toString(), "Unknown"),
                metadata.publishedAt(),
                metadata.updatedAt(),
                metadata.contentSha256(),
                metadata.hasSignature()
        );
    }
}