package ru.doceum.modules.documents.domain.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class Document {
    private UUID id;
    private UUID authorId;
    private String title;
    private String description;
    private DocumentStatus status;
    private String filePath;
    private String contentSha256;
    private Instant createdAt;
    private Instant updatedAt;

    public static Document createNew(UUID id, UUID authorId, String title, String description, String filePath, String contentSha256) {
        Instant now = Instant.now();
        return Document.builder()
                .id(id)
                .authorId(authorId)
                .title(title)
                .description(description)
                .status(DocumentStatus.NOT_PUBLISHED)
                .filePath(filePath)
                .contentSha256(contentSha256)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public void updateDraft(String newTitle, String newDescription, String newFilePath, String newContentSha256) {
        this.title = newTitle;
        this.description = newDescription;
        this.filePath = newFilePath;
        this.contentSha256 = newContentSha256;
        this.updatedAt = Instant.now();
    }

    public void publish() {
        this.status = DocumentStatus.PUBLISHED;
        this.updatedAt = Instant.now();
    }

    public void unpublish() {
        this.status = DocumentStatus.NOT_PUBLISHED;
        this.updatedAt = Instant.now();
    }

    public void archive() {
        this.status = DocumentStatus.ARCHIVED;
        this.updatedAt = Instant.now();
    }
}