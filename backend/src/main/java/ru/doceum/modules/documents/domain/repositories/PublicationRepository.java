package ru.doceum.modules.documents.domain.repositories;

import ru.doceum.modules.documents.domain.models.Publication;
import java.util.Optional;
import java.util.UUID;

public interface PublicationRepository {
    Publication save(Publication publication);
    Optional<Publication> findByDocumentId(UUID documentId);
    void deleteByDocumentId(UUID documentId);
    boolean existsByDocumentId(UUID documentId);
}