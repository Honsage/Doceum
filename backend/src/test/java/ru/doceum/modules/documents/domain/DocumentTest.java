package ru.doceum.modules.documents.domain;

import org.junit.jupiter.api.Test;
import ru.doceum.modules.documents.domain.models.Document;
import ru.doceum.modules.documents.domain.models.DocumentStatus;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class DocumentTest {

    @Test
    void testCreateNewDocument() {
        UUID id = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        String title = "Test Document";
        String description = "Test Description";
        String filePath = "/path/to/file.doceo";
        String contentSha256 = "hash123";

        Document document = Document.createNew(
                id, authorId, title, description, filePath, contentSha256
        );

        assertEquals(id, document.getId());
        assertEquals(authorId, document.getAuthorId());
        assertEquals(title, document.getTitle());
        assertEquals(description, document.getDescription());
        assertEquals(filePath, document.getFilePath());
        assertEquals(contentSha256, document.getContentSha256());
        assertEquals(DocumentStatus.NOT_PUBLISHED, document.getStatus());
        assertNotNull(document.getCreatedAt());
        assertNotNull(document.getUpdatedAt());
    }

    @Test
    void testUpdateDraft() throws InterruptedException {
        Document document = createTestDocument();
        Instant oldUpdatedAt = document.getUpdatedAt();

        String newTitle = "New Title";
        String newDescription = "New Description";
        String newFilePath = "/new/path.doceo";
        String newContentSha256 = "newhash";

        Thread.sleep(10);
        document.updateDraft(newTitle, newDescription, newFilePath, newContentSha256);

        assertEquals(newTitle, document.getTitle());
        assertEquals(newDescription, document.getDescription());
        assertEquals(newFilePath, document.getFilePath());
        assertEquals(newContentSha256, document.getContentSha256());
        assertTrue(document.getUpdatedAt().isAfter(oldUpdatedAt));
    }

    @Test
    void testPublish() {
        Document document = createTestDocument();
        assertEquals(DocumentStatus.NOT_PUBLISHED, document.getStatus());

        document.publish();

        assertEquals(DocumentStatus.PUBLISHED, document.getStatus());
    }

    @Test
    void testUnpublish() {
        Document document = createTestDocument();
        document.publish();
        assertEquals(DocumentStatus.PUBLISHED, document.getStatus());

        document.unpublish();

        assertEquals(DocumentStatus.NOT_PUBLISHED, document.getStatus());
    }

    @Test
    void testArchive() {
        Document document = createTestDocument();
        document.publish();
        assertEquals(DocumentStatus.PUBLISHED, document.getStatus());

        document.archive();

        assertEquals(DocumentStatus.ARCHIVED, document.getStatus());
    }

    private Document createTestDocument() {
        return Document.createNew(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "Test", "Desc",
                "/path.doceo",
                "hash"
        );
    }
}