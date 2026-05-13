package ru.doceum.modules.documents.infrastructure.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Data
@Component
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {
    private String root = "./storage";
    private String drafts = "drafts";
    private String publications = "publications";

    public String getDraftsPath() {
        return root + "/" + drafts;
    }

    public String getPublicationsPath() {
        return root + "/" + publications;
    }

    public String getDraftFilePath(UUID userId, UUID documentId) {
        return getDraftsPath() + "/" + userId + "/" + documentId + ".doceo";
    }

    public String getPublicationFilePath(UUID documentId) {
        return getPublicationsPath() + "/" + documentId + ".doceo";
    }
}