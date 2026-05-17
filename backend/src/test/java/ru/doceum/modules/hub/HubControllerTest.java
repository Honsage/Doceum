package ru.doceum.modules.hub;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import ru.doceum.common.ports.auth.UserInfo;
import ru.doceum.common.ports.auth.UserPort;
import ru.doceum.common.ports.documents.DocumentMetadata;
import ru.doceum.common.ports.documents.DocumentPort;
import ru.doceum.modules.hub.application.services.HubApplicationService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HubControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HubApplicationService hubService;

    @MockBean
    private DocumentPort documentPort;

    @MockBean
    private UserPort userPort;

    private UUID documentId;
    private UUID authorId;
    private DocumentMetadata metadata;
    private UserInfo authorInfo;

    @BeforeEach
    void setUp() {
        documentId = UUID.randomUUID();
        authorId = UUID.randomUUID();

        metadata = new DocumentMetadata(
                documentId, "Test Document", "Test Description",
                authorId, "PUBLISHED", "2024-01-15T10:00:00Z",
                "2024-01-15T10:00:00Z", "hash123", true
        );

        authorInfo = new UserInfo(authorId, "Ivan Petrov", "ivan@example.com");
    }

    @Test
    @WithMockUser(roles = "READER")
    void testGetRecent() throws Exception {
        when(hubService.getRecentDocuments(20, 0)).thenReturn(
                new ru.doceum.modules.hub.application.dto.SearchResponse(
                        List.of(),
                        new ru.doceum.modules.hub.application.dto.PaginationInfo(0, 20, 0, null)
                )
        );

        mockMvc.perform(get("/api/hub/recent"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "READER")
    void testGetRecentWithParams() throws Exception {
        when(hubService.getRecentDocuments(10, 5)).thenReturn(
                new ru.doceum.modules.hub.application.dto.SearchResponse(
                        List.of(),
                        new ru.doceum.modules.hub.application.dto.PaginationInfo(0, 10, 5, null)
                )
        );

        mockMvc.perform(get("/api/hub/recent?limit=10&offset=5"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "READER")
    void testSearchDocumentsByTitle() throws Exception {
        when(hubService.searchByTitle(eq("test"), eq(20), eq(0)))
                .thenReturn(new ru.doceum.modules.hub.application.dto.SearchResponse(
                        List.of(),
                        new ru.doceum.modules.hub.application.dto.PaginationInfo(0, 20, 0, null)
                ));

        mockMvc.perform(get("/api/hub/documents?search=test&type=title"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "READER")
    void testSearchDocumentsByAuthor() throws Exception {
        when(hubService.searchByAuthor(eq("Ivan"), eq(20), eq(0)))
                .thenReturn(new ru.doceum.modules.hub.application.dto.SearchResponse(
                        List.of(),
                        new ru.doceum.modules.hub.application.dto.PaginationInfo(0, 20, 0, null)
                ));

        mockMvc.perform(get("/api/hub/documents?search=Ivan&type=author"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "READER")
    void testSearchDocumentsDefaultType() throws Exception {
        when(hubService.searchByTitle(eq("test"), eq(20), eq(0)))
                .thenReturn(new ru.doceum.modules.hub.application.dto.SearchResponse(
                        List.of(),
                        new ru.doceum.modules.hub.application.dto.PaginationInfo(0, 20, 0, null)
                ));

        mockMvc.perform(get("/api/hub/documents?search=test"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "READER")
    void testSearchDocumentsWithoutSearch() throws Exception {
        when(hubService.getRecentDocuments(20, 0)).thenReturn(
                new ru.doceum.modules.hub.application.dto.SearchResponse(
                        List.of(),
                        new ru.doceum.modules.hub.application.dto.PaginationInfo(0, 20, 0, null)
                )
        );

        mockMvc.perform(get("/api/hub/documents"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "READER")
    void testGetDocumentCard() throws Exception {
        ru.doceum.modules.hub.application.dto.DocumentCardResponse response =
                new ru.doceum.modules.hub.application.dto.DocumentCardResponse(
                        documentId.toString(), "Test Document", "Description",
                        new ru.doceum.modules.hub.application.dto.AuthorInfoResponse(
                                authorId.toString(), "Ivan Petrov"
                        ),
                        "2024-01-15T10:00:00Z", "2024-01-15T10:00:00Z",
                        "hash123", true
                );

        when(hubService.getDocumentCard(documentId)).thenReturn(response);

        mockMvc.perform(get("/api/hub/documents/{id}", documentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(documentId.toString()))
                .andExpect(jsonPath("$.title").value("Test Document"));
    }

    @Test
    @WithMockUser(roles = "READER")
    void testGetDocumentCardWithLimitAndOffset() throws Exception {
        ru.doceum.modules.hub.application.dto.DocumentCardResponse response =
                new ru.doceum.modules.hub.application.dto.DocumentCardResponse(
                        documentId.toString(), "Test Document", "Description",
                        new ru.doceum.modules.hub.application.dto.AuthorInfoResponse(
                                authorId.toString(), "Ivan Petrov"
                        ),
                        "2024-01-15T10:00:00Z", "2024-01-15T10:00:00Z",
                        "hash123", true
                );

        when(hubService.getDocumentCard(documentId)).thenReturn(response);

        mockMvc.perform(get("/api/hub/documents/{id}?limit=5&offset=0", documentId))
                .andExpect(status().isOk());
    }
}