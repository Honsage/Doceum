package ru.doceum.modules.auth.application.usecases;

import ru.doceum.modules.auth.application.dto.AuthResponse;

@FunctionalInterface
public interface RefreshTokenUseCase {
    AuthResponse execute(String refreshToken);
}