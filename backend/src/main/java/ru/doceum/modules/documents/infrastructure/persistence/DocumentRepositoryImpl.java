package ru.doceum.modules.documents.infrastructure.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import ru.doceum.modules.documents.domain.models.Document;
import ru.doceum.modules.documents.domain.models.DocumentStatus;
import ru.doceum.modules.documents.domain.repositories.DocumentRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class DocumentRepositoryImpl implements DocumentRepository {

    private final DocumentJpaRepository jpaRepository;

    @Override
    public Document save(Document document) {
        DocumentEntity entity = DocumentEntity.fromDomain(document);
        return jpaRepository.save(entity).toDomain();
    }

    @Override
    public Optional<Document> findById(UUID id) {
        return jpaRepository.findById(id).map(DocumentEntity::toDomain);
    }

    @Override
    public Optional<Document> findByIdAndAuthorId(UUID id, UUID authorId) {
        return jpaRepository.findByIdAndAuthorId(id, authorId).map(DocumentEntity::toDomain);
    }

    @Override
    public List<Document> findByAuthorIdAndStatusNot(UUID authorId, DocumentStatus excludedStatus) {
        return jpaRepository.findByAuthorIdAndStatusNot(authorId, excludedStatus)
                .stream()
                .map(DocumentEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsById(UUID id) {
        return jpaRepository.existsById(id);
    }

    @Override
    public void delete(Document document) {
        jpaRepository.deleteById(document.getId());
    }
}