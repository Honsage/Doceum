package ru.doceum.modules.documents.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PublicationJpaRepository extends JpaRepository<PublicationEntity, UUID> {
    Optional<PublicationEntity> findByDocumentId(UUID documentId);
    void deleteByDocumentId(UUID documentId);
    boolean existsByDocumentId(UUID documentId);
}