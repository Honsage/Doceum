package ru.doceum.modules.documents.infrastructure.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.doceum.modules.documents.infrastructure.config.StorageProperties;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final StorageProperties storageProperties;

    public String saveDraft(UUID userId, UUID documentId, byte[] content) {
        Path userDir = Paths.get(storageProperties.getDraftsPath() + "/" + userId);
        Path filePath = userDir.resolve(documentId + ".doceo");

        try {
            Files.createDirectories(userDir);
            Files.write(filePath, content);
            log.info("Saved draft: {}", filePath);
            return filePath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to save draft", e);
        }
    }

    public String savePublication(UUID documentId, byte[] content) {
        Path publicationsDir = Paths.get(storageProperties.getPublicationsPath());
        Path filePath = publicationsDir.resolve(documentId + ".doceo");

        try {
            Files.createDirectories(publicationsDir);
            Files.write(filePath, content);
            log.info("Saved publication: {}", filePath);
            return filePath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to save publication", e);
        }
    }

    public byte[] loadFile(String filePath) {
        try {
            return Files.readAllBytes(Paths.get(filePath));
        } catch (IOException e) {
            throw new RuntimeException("Failed to load file: " + filePath, e);
        }
    }

    public void deleteFile(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
            log.info("Deleted file: {}", filePath);
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", filePath, e);
        }
    }

    public boolean fileExists(String filePath) {
        return Files.exists(Paths.get(filePath));
    }
}