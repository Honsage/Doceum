package ru.doceum.modules.documents.infrastructure.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoceoGenerator {

    private final ObjectMapper objectMapper;

    public byte[] generateMinimal(String title, UUID documentId, UUID authorId) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ZipOutputStream zos = new ZipOutputStream(baos);

            // Создаём manifest.json с реальным author_id
            Map<String, Object> manifest = createManifest(documentId, title, authorId);
            zos.putNextEntry(new ZipEntry("manifest.json"));
            zos.write(objectMapper.writeValueAsBytes(manifest));
            zos.closeEntry();

            // Создаём content.json (минимальный валидный контент)
            Map<String, Object> content = createContent(title);
            zos.putNextEntry(new ZipEntry("content.json"));
            zos.write(objectMapper.writeValueAsBytes(content));
            zos.closeEntry();

            zos.finish();
            return baos.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate minimal .doceo", e);
        }
    }

    private Map<String, Object> createManifest(UUID documentId, String title, UUID authorId) {
        Instant now = Instant.now();
        return Map.of(
                "version", "1.0",
                "meta", Map.of(
                        "id", documentId.toString(),
                        "title", title,
                        "author_id", authorId.toString(),  // реальный authorId
                        "created_at", now.toString(),
                        "updated_at", now.toString()
                ),
                "content_filename", "content.json",
                "assets", new Object[]{},
                "content_sha256", ""  // временно пусто, будет заполнено при публикации
        );
    }

    private Map<String, Object> createContent(String title) {
        return Map.of(
                "root", new Object[]{
                        Map.of(
                                "id", generateNodeId(),
                                "type", "heading",
                                "level", 1,
                                "content", Map.of(
                                        "type", "text",
                                        "inlines", new Object[]{
                                                Map.of("type", "span", "text", title, "marks", new Object[]{})
                                        }
                                )
                        ),
                        Map.of(
                                "id", generateNodeId(),
                                "type", "paragraph",
                                "content", Map.of(
                                        "type", "text",
                                        "inlines", new Object[]{
                                                Map.of("type", "span", "text", "", "marks", new Object[]{})
                                        }
                                )
                        )
                }
        );
    }

    private String generateNodeId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}