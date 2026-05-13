package ru.doceum.modules.documents.domain.repositories;

import ru.doceum.modules.documents.domain.models.Document;
import ru.doceum.modules.documents.domain.models.DocumentStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository {
    Document save(Document document);
    Optional<Document> findById(UUID id);
    Optional<Document> findByIdAndAuthorId(UUID id, UUID authorId);
    List<Document> findByAuthorIdAndStatusNot(UUID authorId, DocumentStatus excludedStatus);
    boolean existsById(UUID id);
    void delete(Document document);
}