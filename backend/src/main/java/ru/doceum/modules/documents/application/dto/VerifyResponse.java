package ru.doceum.modules.documents.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerifyResponse {
    private boolean verified;
    private String reason;  // "unsigned", "tampered", "verified"
    private String documentId;  // если verified и документ опубликован на платформе
    private String title;
    private String authorName;
}