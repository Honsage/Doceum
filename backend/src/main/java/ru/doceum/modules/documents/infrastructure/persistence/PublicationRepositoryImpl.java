package ru.doceum.modules.documents.infrastructure.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.doceum.modules.documents.domain.models.Publication;
import ru.doceum.modules.documents.domain.repositories.PublicationRepository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class PublicationRepositoryImpl implements PublicationRepository {

    private final PublicationJpaRepository jpaRepository;

    @Override
    public Publication save(Publication publication) {
        PublicationEntity entity = PublicationEntity.fromDomain(publication);
        return jpaRepository.save(entity).toDomain();
    }

    @Override
    public Optional<Publication> findByDocumentId(UUID documentId) {
        return jpaRepository.findByDocumentId(documentId).map(PublicationEntity::toDomain);
    }

    @Override
    public void deleteByDocumentId(UUID documentId) {
        jpaRepository.deleteByDocumentId(documentId);
    }

    @Override
    public boolean existsByDocumentId(UUID documentId) {
        return jpaRepository.existsByDocumentId(documentId);
    }
}