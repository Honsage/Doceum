package ru.doceum.modules.documents.domain;

import org.junit.jupiter.api.Test;
import ru.doceum.modules.documents.domain.models.DocumentStatus;

import static org.junit.jupiter.api.Assertions.*;

class DocumentStatusTest {

    @Test
    void testDocumentStatusValues() {
        assertEquals(3, DocumentStatus.values().length);
        assertEquals(DocumentStatus.NOT_PUBLISHED, DocumentStatus.valueOf("NOT_PUBLISHED"));
        assertEquals(DocumentStatus.PUBLISHED, DocumentStatus.valueOf("PUBLISHED"));
        assertEquals(DocumentStatus.ARCHIVED, DocumentStatus.valueOf("ARCHIVED"));
    }
}