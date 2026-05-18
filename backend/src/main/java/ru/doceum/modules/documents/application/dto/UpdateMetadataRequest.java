package ru.doceum.modules.documents.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateMetadataRequest {
    @NotBlank
    private String title;
    private String description;
}