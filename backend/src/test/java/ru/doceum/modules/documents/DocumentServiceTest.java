package ru.doceum.modules.documents;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import ru.doceum.modules.documents.application.dto.CreateDocumentRequest;
import ru.doceum.modules.documents.application.services.DocumentApplicationService;
import ru.doceum.modules.documents.domain.models.Document;
import ru.doceum.modules.documents.domain.models.DocumentStatus;
import ru.doceum.modules.documents.domain.repositories.DocumentRepository;
import ru.doceum.modules.documents.infrastructure.services.DoceoGenerator;
import ru.doceum.modules.documents.infrastructure.services.DoceoParser;
import ru.doceum.modules.documents.infrastructure.storage.FileStorageService;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class DocumentServiceTest {

    @Autowired
    private DocumentApplicationService documentService;

    @MockBean
    private DocumentRepository documentRepository;

    @MockBean
    private FileStorageService fileStorageService;

    @MockBean
    private DoceoGenerator doceoGenerator;

    @MockBean
    private DoceoParser doceoParser;

    private UUID authorId;
    private CreateDocumentRequest createRequest;

    @BeforeEach
    void setUp() {
        authorId = UUID.randomUUID();
        createRequest = new CreateDocumentRequest();
        createRequest.setTitle("Test Document");
        createRequest.setDescription("Test Description");

        // Мокаем генерацию .doceo
        when(doceoGenerator.generateMinimal(any(), any(), any())).thenReturn(new byte[100]);
        when(doceoParser.calculateContentSha256(any(byte[].class))).thenReturn("test_hash_123");
        when(fileStorageService.saveDraft(any(), any(), any())).thenReturn("/test/path/file.doceo");
        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testCreateDocumentSuccess() {
        UUID documentId = documentService.createDocument(authorId, createRequest);

        assertNotNull(documentId);
    }

    @Test
    void testDeleteDocumentArchives() {
        UUID documentId = UUID.randomUUID();
        Document mockDocument = Document.createNew(
                documentId, authorId, "Title", "Desc", "/path", "hash"
        );

        when(documentRepository.findByIdAndAuthorId(documentId, authorId))
                .thenReturn(Optional.of(mockDocument));

        documentService.deleteDocument(documentId, authorId);

        assertEquals(DocumentStatus.ARCHIVED, mockDocument.getStatus());
    }

    @Test
    void testDeleteDocumentNotFound() {
        UUID documentId = UUID.randomUUID();
        when(documentRepository.findByIdAndAuthorId(documentId, authorId))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> documentService.deleteDocument(documentId, authorId));

        assertEquals("Document not found or access denied", exception.getMessage());
    }
}