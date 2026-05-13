package ru.doceum.modules.auth.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Data
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String role;
    private String surname;
    private String name;
    private String patronymic;
    private String organization;
    private String position;
}