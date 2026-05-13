package ru.doceum.common.ports.auth;

import java.util.UUID;

public record UserInfo(
        UUID id,
        String fullName,
        String email
) {}
