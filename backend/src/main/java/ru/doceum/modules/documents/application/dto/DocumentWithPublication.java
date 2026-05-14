package ru.doceum.modules.documents.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import ru.doceum.modules.documents.domain.models.Document;
import ru.doceum.modules.documents.domain.models.DocumentStatus;
import ru.doceum.modules.documents.domain.models.Publication;

import java.time.Instant;
import java.util.UUID;

@AllArgsConstructor
@Getter
public class DocumentWithPublication {
    private final Document document;
    private final Publication publication;

    public UUID getId() {
        return publication.getDocumentId();
    }

    public String getTitle() {
        return publication.getTitle();
    }

    public String getDescription() {
        return publication.getDescription();
    }

    public UUID getAuthorId() {
        return document.getAuthorId();
    }

    public DocumentStatus getStatus() {
        return document.getStatus();
    }

    public Instant getPublishedAt() {
        return publication != null ? publication.getPublishedAt() : null;
    }

    public Instant getUpdatedAt() {
        return document.getUpdatedAt();
    }

    public String getContentSha256() {
        return document.getContentSha256();
    }
}
