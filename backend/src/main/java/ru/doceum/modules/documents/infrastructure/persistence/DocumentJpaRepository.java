package ru.doceum.modules.documents.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.doceum.modules.documents.domain.models.DocumentStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentJpaRepository extends JpaRepository<DocumentEntity, UUID> {
    Optional<DocumentEntity> findByIdAndAuthorId(UUID id, UUID authorId);
    List<DocumentEntity> findByAuthorIdAndStatusNot(UUID authorId, DocumentStatus excludedStatus);
    List<DocumentEntity> findByStatus(DocumentStatus status);
    List<DocumentEntity> findByAuthorIdAndStatus(UUID authorId, DocumentStatus status);
    boolean existsById(UUID id);
}