package ru.doceum.modules.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import ru.doceum.modules.auth.application.dto.AuthResponse;
import ru.doceum.modules.auth.application.dto.LoginRequest;
import ru.doceum.modules.auth.application.dto.RegisterRequest;
import ru.doceum.modules.auth.application.services.AuthApplicationService;
import ru.doceum.modules.auth.domain.models.User;
import ru.doceum.modules.auth.domain.models.UserRole;
import ru.doceum.modules.auth.domain.repositories.UserRepository;
import ru.doceum.modules.auth.domain.valueobjects.Email;
import ru.doceum.modules.auth.domain.valueobjects.Password;
import ru.doceum.modules.auth.infrastructure.security.JwtService;
import ru.doceum.modules.auth.infrastructure.security.RefreshTokenService;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class AuthServiceTest {

    @Autowired
    private AuthApplicationService authService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private RefreshTokenService refreshTokenService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setRole("READER");
        registerRequest.setSurname("Test");
        registerRequest.setName("User");
        registerRequest.setPatronymic("Testovich");
        registerRequest.setOrganization("TestOrg");
        registerRequest.setPosition("Tester");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        mockUser = User.register(
                new Email("test@example.com"),
                new Password("encodedPassword"),
                UserRole.READER,
                "Test", "User", "Testovich", "TestOrg", "Tester"
        );
    }

    // ===== Register Tests =====

    @Test
    void testRegisterSuccess() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("accessToken");
        when(refreshTokenService.createRefreshToken(any())).thenReturn("refreshToken");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        AuthResponse response = authService.execute(registerRequest);

        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertNotNull(response.getUser());
        assertEquals("test@example.com", response.getUser().getEmail());
        assertEquals("READER", response.getUser().getRole());
        assertEquals("Test", response.getUser().getSurname());
        assertEquals("User", response.getUser().getName());
    }

    @Test
    void testRegisterDuplicateEmail() {
        when(userRepository.existsByEmail(any())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.execute(registerRequest));

        assertEquals("User already exists", exception.getMessage());
    }

    @Test
    void testRegisterWithAuthorRole() {
        registerRequest.setRole("AUTHOR");

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("accessToken");
        when(refreshTokenService.createRefreshToken(any())).thenReturn("refreshToken");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.execute(registerRequest);

        assertNotNull(response);
        assertEquals("AUTHOR", response.getUser().getRole());
    }

    @Test
    void testRegisterWithAdminRole() {
        registerRequest.setRole("ADMIN");

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("accessToken");
        when(refreshTokenService.createRefreshToken(any())).thenReturn("refreshToken");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.execute(registerRequest);

        assertNotNull(response);
        assertEquals("ADMIN", response.getUser().getRole());
    }

    @Test
    void testRegisterWithInvalidRole() {
        registerRequest.setRole("INVALID_ROLE");

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("accessToken");
        when(refreshTokenService.createRefreshToken(any())).thenReturn("refreshToken");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.execute(registerRequest);

        // Invalid role defaults to READER
        assertNotNull(response);
        assertEquals("READER", response.getUser().getRole());
    }

    @Test
    void testRegisterWithMissingRequiredFields() {
        registerRequest.setSurname(null);

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("accessToken");
        when(refreshTokenService.createRefreshToken(any())).thenReturn("refreshToken");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Should still work, but validation is handled by @Valid in controller
        AuthResponse response = authService.execute(registerRequest);
        assertNotNull(response);
    }

    // ===== Login Tests =====

    @Test
    void testLoginSuccess() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("accessToken");
        when(refreshTokenService.createRefreshToken(any())).thenReturn("refreshToken");

        AuthResponse response = authService.execute(loginRequest);

        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertNotNull(response.getUser());
        assertEquals("test@example.com", response.getUser().getEmail());
    }

    @Test
    void testLoginUserNotFound() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.execute(loginRequest));

        assertEquals("Invalid credentials", exception.getMessage());
    }

    @Test
    void testLoginInvalidPassword() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.execute(loginRequest));

        assertEquals("Invalid credentials", exception.getMessage());
    }

    // ===== Refresh Token Tests =====

    @Test
    void testRefreshTokenSuccess() {
        String refreshToken = "validRefreshToken";
        String userId = UUID.randomUUID().toString();

        when(refreshTokenService.validateRefreshToken(refreshToken)).thenReturn(Optional.of(userId));
        when(userRepository.findById(UUID.fromString(userId))).thenReturn(Optional.of(mockUser));
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("newAccessToken");
        when(refreshTokenService.createRefreshToken(userId)).thenReturn("newRefreshToken");

        AuthResponse response = authService.execute(refreshToken);

        assertNotNull(response);
        assertEquals("newAccessToken", response.getAccessToken());
        assertEquals("newRefreshToken", response.getRefreshToken());
    }

    @Test
    void testRefreshTokenInvalid() {
        String refreshToken = "invalidRefreshToken";

        when(refreshTokenService.validateRefreshToken(refreshToken)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.execute(refreshToken));

        assertEquals("Invalid refresh token", exception.getMessage());
    }

    @Test
    void testRefreshTokenUserNotFound() {
        String refreshToken = "validRefreshToken";
        String userId = UUID.randomUUID().toString();

        when(refreshTokenService.validateRefreshToken(refreshToken)).thenReturn(Optional.of(userId));
        when(userRepository.findById(UUID.fromString(userId))).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.execute(refreshToken));

        assertEquals("User not found", exception.getMessage());
    }

    // ===== Logout Tests =====

    @Test
    void testLogoutSuccess() {
        String refreshToken = "testRefreshToken";
        String userId = "testUserId";

        assertDoesNotThrow(() -> authService.execute(refreshToken, userId));

        verify(refreshTokenService, times(1)).revokeRefreshToken(refreshToken, userId);
    }
}