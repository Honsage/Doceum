package ru.doceum.modules.hub.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthorInfoResponse {
    private String id;
    private String fullName;
}