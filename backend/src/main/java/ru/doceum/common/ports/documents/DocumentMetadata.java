package ru.doceum.common.ports.documents;

import java.util.UUID;

public record DocumentMetadata(
        UUID id,
        String title,
        String description,
        UUID authorId,
        String status,
        String publishedAt,     // null если не опубликован
        String updatedAt
) {}
