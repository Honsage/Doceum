package ru.doceum.modules.documents.domain.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class Publication {
    private UUID documentId;
    private String title;
    private String description;
    private String filePath;
    private String signature;
    private Instant publishedAt;

    public static Publication fromDocument(Document document, String publishedFilePath, String signature) {
        return Publication.builder()
                .documentId(document.getId())
                .title(document.getTitle())
                .description(document.getDescription())
                .filePath(publishedFilePath)
                .signature(signature)
                .publishedAt(Instant.now())
                .build();
    }
}