package ru.doceum.modules.documents.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.doceum.modules.documents.domain.models.Document;
import ru.doceum.modules.documents.domain.models.DocumentStatus;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "document")
@Getter
@Setter
@NoArgsConstructor
public class DocumentEntity {

    @Id
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(name = "author_id", nullable = false, columnDefinition = "UUID")
    private UUID authorId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DocumentStatus status;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "content_sha256", nullable = false)
    private String contentSha256;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public static DocumentEntity fromDomain(Document document) {
        DocumentEntity entity = new DocumentEntity();
        entity.setId(document.getId());
        entity.setAuthorId(document.getAuthorId());
        entity.setTitle(document.getTitle());
        entity.setDescription(document.getDescription());
        entity.setStatus(document.getStatus());
        entity.setFilePath(document.getFilePath());
        entity.setContentSha256(document.getContentSha256());
        entity.setCreatedAt(document.getCreatedAt());
        entity.setUpdatedAt(document.getUpdatedAt());
        return entity;
    }

    public Document toDomain() {
        return Document.builder()
                .id(id)
                .authorId(authorId)
                .title(title)
                .description(description)
                .status(status)
                .filePath(filePath)
                .contentSha256(contentSha256)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }
}