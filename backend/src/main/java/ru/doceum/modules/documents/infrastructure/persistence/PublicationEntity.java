package ru.doceum.modules.documents.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.doceum.modules.documents.domain.models.Publication;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "publication")
@Getter
@Setter
@NoArgsConstructor
public class PublicationEntity {

    @Id
    @Column(name = "document_id", columnDefinition = "UUID")
    private UUID documentId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String signature;

    @Column(name = "published_at", nullable = false)
    private Instant publishedAt;

    public static PublicationEntity fromDomain(Publication publication) {
        PublicationEntity entity = new PublicationEntity();
        entity.setDocumentId(publication.getDocumentId());
        entity.setTitle(publication.getTitle());
        entity.setDescription(publication.getDescription());
        entity.setFilePath(publication.getFilePath());
        entity.setSignature(publication.getSignature());
        entity.setPublishedAt(publication.getPublishedAt());
        return entity;
    }

    public Publication toDomain() {
        return Publication.builder()
                .documentId(documentId)
                .title(title)
                .description(description)
                .filePath(filePath)
                .signature(signature)
                .publishedAt(publishedAt)
                .build();
    }
}