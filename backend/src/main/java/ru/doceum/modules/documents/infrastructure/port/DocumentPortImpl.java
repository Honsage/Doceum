package ru.doceum.modules.documents.infrastructure.port;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.doceum.common.ports.documents.DocumentFile;
import ru.doceum.common.ports.documents.DocumentMetadata;
import ru.doceum.common.ports.documents.DocumentPort;
import ru.doceum.modules.documents.application.services.DocumentApplicationService;

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
                response.getUpdatedAt()
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
    public List<DocumentMetadata> getUserDocuments(UUID authorId) {
        // Временно: получаем через репозиторий, потом сделаем отдельный метод в сервисе
        // Для MVP можно напрямую из репозитория, но пока заглушка
        return List.of();
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
}