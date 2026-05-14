package ru.doceum.modules.documents.infrastructure.port;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.doceum.common.ports.documents.DocumentFile;
import ru.doceum.common.ports.documents.DocumentMetadata;
import ru.doceum.common.ports.documents.DocumentPort;
import ru.doceum.modules.documents.application.dto.DocumentWithPublication;
import ru.doceum.modules.documents.application.services.DocumentApplicationService;
import ru.doceum.modules.documents.domain.models.DocumentStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DocumentPortImpl implements DocumentPort {

    private final DocumentApplicationService documentService;

    @Override
    public DocumentMetadata getMetadata(UUID documentId) {
        var response = documentService.getMetadata(documentId);
        return new DocumentMetadata(
                UUID.fromString(response.getId()),
                response.getTitle(),
                response.getDescription(),
                UUID.fromString(response.getAuthor().getId()),
                response.getStatus(),
                response.getPublishedAt(),
                response.getUpdatedAt(),
                null,  // contentSha256 пока не возвращаем через этот метод
                response.getStatus().equals("PUBLISHED")
        );
    }

    @Override
    public Optional<DocumentFile> getPublicationFile(UUID documentId) {
        try {
            byte[] content = documentService.getPublicationFile(documentId);
            return Optional.of(new DocumentFile(content, documentId + ".doceo", "application/octet-stream"));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean existsPublished(UUID documentId) {
        try {
            documentService.getPublicationFile(documentId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<DocumentMetadata> getAllPublishedDocuments() {
        return documentService.getAllPublishedDocuments().stream()
                .map(doc -> new DocumentMetadata(
                        doc.getId(),
                        doc.getTitle(),
                        doc.getDescription(),
                        doc.getAuthorId(),
                        doc.getStatus().name(),
                        doc.getPublishedAt() != null ? doc.getPublishedAt().toString() : null,
                        doc.getUpdatedAt().toString(),
                        doc.getContentSha256(),
                        true
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentMetadata> getUserDocuments(UUID authorId) {
        // Временно: получаем через репозиторий, потом сделаем отдельный метод в сервисе
        // Для MVP можно напрямую из репозитория, но пока заглушка
        return List.of();
    }

    @Override
    public List<DocumentMetadata> getPublishedDocumentsByAuthorId(UUID authorId) {
        return documentService.getPublishedDocumentsByAuthorId(authorId).stream()
                .map(doc -> new DocumentMetadata(
                        doc.getId(),
                        doc.getTitle(),
                        doc.getDescription(),
                        doc.getAuthorId(),
                        doc.getStatus().name(),
                        doc.getPublishedAt() != null ? doc.getPublishedAt().toString() : null,
                        doc.getUpdatedAt().toString(),
                        doc.getContentSha256(),
                        true
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentMetadata> getDocumentsByAuthorIdAndStatus(UUID authorId, String status) {
        List<DocumentWithPublication> docs;

        if ("NOT_PUBLISHED".equals(status)) {
            docs = documentService.getDraftsByAuthorId(authorId);
        } else if ("PUBLISHED".equals(status)) {
            docs = documentService.getPublishedDocumentsByAuthorId(authorId);
        } else {
            return List.of();
        }

        return docs.stream()
                .map(doc -> new DocumentMetadata(
                        doc.getDocument().getId(),
                        doc.getDocument().getTitle(),
                        doc.getDocument().getDescription(),
                        doc.getDocument().getAuthorId(),
                        doc.getDocument().getStatus().name(),
                        doc.getPublishedAt() != null ? doc.getPublishedAt().toString() : null,
                        doc.getDocument().getUpdatedAt().toString(),
                        doc.getDocument().getContentSha256(),
                        doc.getPublication() != null
                ))
                .collect(Collectors.toList());
    }
}