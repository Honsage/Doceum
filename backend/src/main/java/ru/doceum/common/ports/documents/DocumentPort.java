package ru.doceum.common.ports.documents;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentPort {
    DocumentMetadata getMetadata(UUID documentId);
    Optional<DocumentFile> getPublicationFile(UUID documentId);
    List<DocumentMetadata> getUserDocuments(UUID authorId);
    boolean existsPublished(UUID documentId);
    List<DocumentMetadata> getAllPublishedDocuments();
    List<DocumentMetadata> getPublishedDocumentsByAuthorId(UUID authorId);
}
