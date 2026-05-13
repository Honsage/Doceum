package ru.doceum.modules.auth.application.usecases;

import ru.doceum.modules.auth.application.dto.LoginRequest;
import ru.doceum.modules.auth.application.dto.AuthResponse;

@FunctionalInterface
public interface LoginUseCase {
    AuthResponse execute(LoginRequest request);
}