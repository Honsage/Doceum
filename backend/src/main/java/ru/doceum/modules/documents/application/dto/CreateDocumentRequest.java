package ru.doceum.modules.documents.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDocumentRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;
}