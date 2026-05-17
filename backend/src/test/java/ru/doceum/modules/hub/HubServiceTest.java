package ru.doceum.modules.hub;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import ru.doceum.common.ports.auth.UserInfo;
import ru.doceum.common.ports.auth.UserPort;
import ru.doceum.common.ports.documents.DocumentMetadata;
import ru.doceum.common.ports.documents.DocumentPort;
import ru.doceum.modules.hub.application.dto.DocumentCardResponse;
import ru.doceum.modules.hub.application.dto.SearchResponse;
import ru.doceum.modules.hub.application.services.HubApplicationService;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class HubServiceTest {

    @Autowired
    private HubApplicationService hubService;

    @MockBean
    private DocumentPort documentPort;

    @MockBean
    private UserPort userPort;

    private UUID documentId1;
    private UUID documentId2;
    private UUID authorId;
    private DocumentMetadata metadata1;
    private DocumentMetadata metadata2;
    private UserInfo authorInfo;

    @BeforeEach
    void setUp() {
        documentId1 = UUID.randomUUID();
        documentId2 = UUID.randomUUID();
        authorId = UUID.randomUUID();

        metadata1 = new DocumentMetadata(
                documentId1, "Python Basics", "Learn Python from scratch",
                authorId, "PUBLISHED", "2024-01-15T10:00:00Z",
                "2024-01-15T10:00:00Z", "hash123", true
        );

        metadata2 = new DocumentMetadata(
                documentId2, "Java Advanced", "Advanced Java concepts",
                authorId, "PUBLISHED", "2024-01-10T10:00:00Z",
                "2024-01-10T10:00:00Z", "hash456", true
        );

        authorInfo = new UserInfo(authorId, "Ivan Petrov", "ivan@example.com");
    }

    // ===== Get Recent Documents Tests =====

    @Test
    void testGetRecentDocumentsSuccess() {
        when(documentPort.getAllPublishedDocuments()).thenReturn(List.of(metadata1, metadata2));
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        SearchResponse response = hubService.getRecentDocuments(10, 0);

        assertNotNull(response);
        assertNotNull(response.getItems());
        assertEquals(2, response.getItems().size());
        assertEquals("Python Basics", response.getItems().get(0).getTitle());
        assertEquals("Java Advanced", response.getItems().get(1).getTitle());
    }

    @Test
    void testGetRecentDocumentsEmpty() {
        when(documentPort.getAllPublishedDocuments()).thenReturn(List.of());

        SearchResponse response = hubService.getRecentDocuments(10, 0);

        assertNotNull(response);
        assertTrue(response.getItems().isEmpty());
        assertEquals(0, response.getPagination().getTotal());
    }

    @Test
    void testGetRecentDocumentsWithPagination() {
        when(documentPort.getAllPublishedDocuments()).thenReturn(List.of(metadata1, metadata2));
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        SearchResponse response = hubService.getRecentDocuments(1, 0);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals(2, response.getPagination().getTotal());
        assertNotNull(response.getPagination().getNextOffset());
    }

    // ===== Search By Title Tests =====

    @Test
    void testSearchByTitleSuccess() {
        when(documentPort.getAllPublishedDocuments()).thenReturn(List.of(metadata1, metadata2));
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        SearchResponse response = hubService.searchByTitle("Python", 10, 0);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals("Python Basics", response.getItems().get(0).getTitle());
    }

    @Test
    void testSearchByTitleCaseInsensitive() {
        when(documentPort.getAllPublishedDocuments()).thenReturn(List.of(metadata1, metadata2));
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        SearchResponse response = hubService.searchByTitle("python", 10, 0);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
    }

    @Test
    void testSearchByTitleNotFound() {
        when(documentPort.getAllPublishedDocuments()).thenReturn(List.of(metadata1, metadata2));
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        SearchResponse response = hubService.searchByTitle("Ruby", 10, 0);

        assertNotNull(response);
        assertTrue(response.getItems().isEmpty());
        assertEquals(0, response.getPagination().getTotal());
    }

    @Test
    void testSearchByTitleEmptyQuery() {
        when(documentPort.getAllPublishedDocuments()).thenReturn(List.of(metadata1, metadata2));
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        SearchResponse response = hubService.searchByTitle("", 10, 0);

        assertNotNull(response);
        assertEquals(2, response.getItems().size());
    }

    // ===== Search By Author Tests =====

    @Test
    void testSearchByAuthorSuccess() {
        when(userPort.findUsersByFullNameLike("Ivan")).thenReturn(List.of(authorInfo));
        when(documentPort.getPublishedDocumentsByAuthorId(authorId)).thenReturn(List.of(metadata1, metadata2));
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        SearchResponse response = hubService.searchByAuthor("Ivan", 10, 0);

        assertNotNull(response);
        assertEquals(2, response.getItems().size());
    }

    @Test
    void testSearchByAuthorNotFound() {
        when(userPort.findUsersByFullNameLike("Unknown")).thenReturn(List.of());

        SearchResponse response = hubService.searchByAuthor("Unknown", 10, 0);

        assertNotNull(response);
        assertTrue(response.getItems().isEmpty());
        assertEquals(0, response.getPagination().getTotal());
    }

    @Test
    void testSearchByAuthorPartialMatch() {
        when(userPort.findUsersByFullNameLike("Pet")).thenReturn(List.of(authorInfo));
        when(documentPort.getPublishedDocumentsByAuthorId(authorId)).thenReturn(List.of(metadata1));
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        SearchResponse response = hubService.searchByAuthor("Pet", 10, 0);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
    }

    @Test
    void testSearchByAuthorEmptyQuery() {
        when(userPort.findUsersByFullNameLike("")).thenReturn(List.of());

        SearchResponse response = hubService.searchByAuthor("", 10, 0);

        assertNotNull(response);
        assertTrue(response.getItems().isEmpty());
    }

    // ===== Get Document Card Tests =====

    @Test
    void testGetDocumentCardSuccess() {
        when(documentPort.getMetadata(documentId1)).thenReturn(metadata1);
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        DocumentCardResponse response = hubService.getDocumentCard(documentId1);

        assertNotNull(response);
        assertEquals(documentId1.toString(), response.getId());
        assertEquals("Python Basics", response.getTitle());
        assertEquals("Learn Python from scratch", response.getDescription());
        assertEquals("Ivan Petrov", response.getAuthor().getFullName());
        assertNotNull(response.getPublishedAt());
        assertTrue(response.isHasSignature());
    }

    @Test
    void testGetDocumentCardNotPublished() {
        DocumentMetadata notPublished = new DocumentMetadata(
                documentId1, "Draft", "Not published",
                authorId, "NOT_PUBLISHED", null,
                "2024-01-15T10:00:00Z", "hash123", false
        );

        when(documentPort.getMetadata(documentId1)).thenReturn(notPublished);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> hubService.getDocumentCard(documentId1));

        assertEquals("Document not published", exception.getMessage());
    }

    @Test
    void testGetDocumentCardAuthorNotFound() {
        when(documentPort.getMetadata(documentId1)).thenReturn(metadata1);
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> hubService.getDocumentCard(documentId1));

        assertEquals("Author not found", exception.getMessage());
    }

    @Test
    void testGetDocumentCardNotFound() {
        when(documentPort.getMetadata(any(UUID.class))).thenThrow(new RuntimeException("Document not found"));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> hubService.getDocumentCard(UUID.randomUUID()));

        assertEquals("Document not found", exception.getMessage());
    }

    // ===== Pagination Tests =====

    @Test
    void testPaginationLimitGreaterThanMax() {
        when(documentPort.getAllPublishedDocuments()).thenReturn(List.of(metadata1, metadata2));
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        // Limit больше MAX_LIMIT (100) должно быть ограничено
        SearchResponse response = hubService.getRecentDocuments(200, 0);

        assertNotNull(response);
        assertEquals(100, response.getPagination().getLimit());
    }

    @Test
    void testPaginationNegativeLimit() {
        when(documentPort.getAllPublishedDocuments()).thenReturn(List.of(metadata1, metadata2));
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        SearchResponse response = hubService.getRecentDocuments(-5, 0);

        assertNotNull(response);
        assertEquals(20, response.getPagination().getLimit()); // DEFAULT_LIMIT
    }

    @Test
    void testPaginationNegativeOffset() {
        when(documentPort.getAllPublishedDocuments()).thenReturn(List.of(metadata1, metadata2));
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        SearchResponse response = hubService.getRecentDocuments(10, -10);

        assertNotNull(response);
        assertEquals(0, response.getPagination().getOffset());
    }

    @Test
    void testPaginationOffsetOutOfBounds() {
        when(documentPort.getAllPublishedDocuments()).thenReturn(List.of(metadata1, metadata2));
        when(userPort.getUserInfo(authorId)).thenReturn(Optional.of(authorInfo));

        SearchResponse response = hubService.getRecentDocuments(10, 100);

        assertNotNull(response);
        assertTrue(response.getItems().isEmpty());
        assertEquals(2, response.getPagination().getTotal());
        assertNull(response.getPagination().getNextOffset());
    }
}