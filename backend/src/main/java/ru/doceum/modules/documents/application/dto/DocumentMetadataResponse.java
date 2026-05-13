package ru.doceum.modules.documents.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DocumentMetadataResponse {
    private String id;
    private String title;
    private String description;
    private AuthorInfoResponse author;
    private String status;
    private String publishedAt;
    private String updatedAt;
}

