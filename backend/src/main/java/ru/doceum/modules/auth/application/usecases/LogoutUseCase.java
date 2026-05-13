package ru.doceum.modules.auth.application.usecases;

@FunctionalInterface
public interface LogoutUseCase {
    void execute(String refreshToken, String userId);
}