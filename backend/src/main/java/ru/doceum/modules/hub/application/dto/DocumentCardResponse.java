package ru.doceum.modules.hub.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DocumentCardResponse {
    private String id;
    private String title;
    private String description;
    private AuthorInfoResponse author;
    private String publishedAt;
    private String updatedAt;
    private String contentSha256;
    private boolean hasSignature;
}