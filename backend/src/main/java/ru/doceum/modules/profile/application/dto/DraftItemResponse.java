package ru.doceum.modules.profile.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DraftItemResponse {
    private String documentId;
    private String title;
    private String description;
    private String status;
    private String updatedAt;
    private String createdAt;
}