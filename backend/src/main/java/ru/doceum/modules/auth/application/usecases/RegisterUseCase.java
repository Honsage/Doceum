package ru.doceum.modules.auth.application.usecases;

import ru.doceum.modules.auth.application.dto.RegisterRequest;
import ru.doceum.modules.auth.application.dto.AuthResponse;

@FunctionalInterface
public interface RegisterUseCase {
    AuthResponse execute(RegisterRequest request);
}