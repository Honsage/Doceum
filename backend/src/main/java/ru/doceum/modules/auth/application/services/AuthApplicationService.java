package ru.doceum.modules.auth.application.services;

import ru.doceum.modules.auth.application.dto.*;
import ru.doceum.modules.auth.application.usecases.*;
import ru.doceum.modules.auth.domain.models.User;
import ru.doceum.modules.auth.domain.models.UserRole;
import ru.doceum.modules.auth.domain.repositories.UserRepository;
import ru.doceum.modules.auth.domain.valueobjects.Email;
import ru.doceum.modules.auth.domain.valueobjects.Password;
import ru.doceum.modules.auth.infrastructure.security.JwtService;
import ru.doceum.modules.auth.infrastructure.security.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthApplicationService implements RegisterUseCase, LoginUseCase, RefreshTokenUseCase, LogoutUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Override
    @Transactional
    public AuthResponse execute(RegisterRequest request) {
        Email email = new Email(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        Password password = new Password(hashedPassword);

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole());
        } catch (IllegalArgumentException e) {
            role = UserRole.READER;
        }

        User user = User.register(
                email,
                password,
                role,
                request.getSurname(),
                request.getName(),
                request.getPatronymic(),
                request.getOrganization(),
                request.getPosition()
        );

        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user.getId().toString());

        return new AuthResponse(accessToken, refreshToken, toUserResponse(user));
    }

    @Override
    @Transactional
    public AuthResponse execute(LoginRequest request) {
        Email email = new Email(request.getEmail());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword().hashedValue())) {
            throw new RuntimeException("Invalid credentials");
        }

        user.updateLastLogin();
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user.getId().toString());

        return new AuthResponse(accessToken, refreshToken, toUserResponse(user));
    }

    @Override
    public AuthResponse execute(String refreshToken) {
        String userId = refreshTokenService.validateRefreshToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = refreshTokenService.createRefreshToken(userId);

        return new AuthResponse(newAccessToken, newRefreshToken, toUserResponse(user));
    }

    @Override
    public void execute(String refreshToken, String userId) {
        refreshTokenService.revokeRefreshToken(refreshToken, userId);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail().value(),
                user.getRole().name(),
                user.getSurname(),
                user.getName(),
                user.getPatronymic(),
                user.getOrganization(),
                user.getPosition()
        );
    }
}