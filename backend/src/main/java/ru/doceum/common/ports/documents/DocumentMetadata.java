package ru.doceum.common.ports.documents;

import java.util.UUID;

public record DocumentMetadata(
        UUID id,
        String title,
        String description,
        UUID authorId,
        String status,
        String publishedAt,
        String updatedAt,
        String contentSha256,
        boolean hasSignature
) {
    public DocumentMetadata {
        if (id == null) throw new IllegalArgumentException("id cannot be null");
        if (title == null) throw new IllegalArgumentException("title cannot be null");
        if (authorId == null) throw new IllegalArgumentException("authorId cannot be null");
    }
}