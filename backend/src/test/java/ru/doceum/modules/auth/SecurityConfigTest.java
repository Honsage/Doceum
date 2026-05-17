package ru.doceum.modules.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import ru.doceum.modules.auth.infrastructure.security.JwtService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private String readerToken;
    private String authorToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        readerToken = generateTokenForRole("READER");
        authorToken = generateTokenForRole("AUTHOR");
        adminToken = generateTokenForRole("ADMIN");
    }

    private String generateTokenForRole(String role) {
        ru.doceum.modules.auth.domain.models.User user = ru.doceum.modules.auth.domain.models.User.register(
                new ru.doceum.modules.auth.domain.valueobjects.Email("test@example.com"),
                new ru.doceum.modules.auth.domain.valueobjects.Password("encoded"),
                ru.doceum.modules.auth.domain.models.UserRole.valueOf(role),
                "Test", "User", null, null, null
        );
        return jwtService.generateAccessToken(user);
    }

    // ===== Hub эндпоинты =====

    @Test
    void testHubRecentWithoutAuth() throws Exception {
        // Без токена Spring Security возвращает 401 Unauthorized или 403 Forbidden
        // Ожидаем любой 4xx, так как главное — доступ запрещён
        mockMvc.perform(get("/api/hub/recent"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void testHubRecentWithReader() throws Exception {
        mockMvc.perform(get("/api/hub/recent")
                        .header("Authorization", "Bearer " + readerToken))
                .andExpect(status().isOk());
    }

    @Test
    void testHubRecentWithAuthor() throws Exception {
        mockMvc.perform(get("/api/hub/recent")
                        .header("Authorization", "Bearer " + authorToken))
                .andExpect(status().isOk());
    }

    @Test
    void testHubRecentWithAdmin() throws Exception {
        mockMvc.perform(get("/api/hub/recent")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    // ===== Profile избранное =====

    @Test
    void testFavoritesWithoutAuth() throws Exception {
        // Без токена — доступ запрещён (401 или 403)
        mockMvc.perform(get("/api/profile/favorites"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void testFavoritesWithReader() throws Exception {
        mockMvc.perform(get("/api/profile/favorites")
                        .header("Authorization", "Bearer " + readerToken))
                .andExpect(status().isOk());
    }

    @Test
    void testFavoritesWithAuthor() throws Exception {
        mockMvc.perform(get("/api/profile/favorites")
                        .header("Authorization", "Bearer " + authorToken))
                .andExpect(status().isOk());
    }

    @Test
    void testFavoritesWithAdmin() throws Exception {
        mockMvc.perform(get("/api/profile/favorites")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
}