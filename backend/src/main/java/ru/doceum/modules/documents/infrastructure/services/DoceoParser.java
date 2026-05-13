package ru.doceum.modules.documents.infrastructure.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.security.MessageDigest;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoceoParser {

    private final ObjectMapper objectMapper;

    public void validate(byte[] doceoContent) {
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(doceoContent))) {
            boolean hasManifest = false;
            boolean hasContent = false;

            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.getName().equals("manifest.json")) hasManifest = true;
                if (entry.getName().equals("content.json")) hasContent = true;
                zis.closeEntry();
            }

            if (!hasManifest || !hasContent) {
                throw new RuntimeException("Invalid .doceo: missing manifest.json or content.json");
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid .doceo", e);
        }
    }

    public String calculateContentSha256(byte[] doceoContent) {
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(doceoContent))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.getName().equals("content.json")) {
                    byte[] contentBytes = zis.readAllBytes();
                    MessageDigest digest = MessageDigest.getInstance("SHA-256");
                    byte[] hash = digest.digest(contentBytes);
                    StringBuilder hexString = new StringBuilder();
                    for (byte b : hash) {
                        String hex = Integer.toHexString(0xff & b);
                        if (hex.length() == 1) hexString.append('0');
                        hexString.append(hex);
                    }
                    return hexString.toString();
                }
                zis.closeEntry();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate content SHA256", e);
        }
        throw new RuntimeException("content.json not found");
    }

    public boolean isIntegrityValid(byte[] doceoContent) {
        try {
            String calculated = calculateContentSha256(doceoContent);
            String manifestSha256 = extractContentSha256FromManifest(doceoContent);
            return calculated.equals(manifestSha256);
        } catch (Exception e) {
            return false;
        }
    }

    public String extractSignature(byte[] doceoContent) {
        try {
            JsonNode manifest = extractManifest(doceoContent);
            JsonNode signatureNode = manifest.get("signature");
            return signatureNode != null ? signatureNode.asText() : null;
        } catch (Exception e) {
            return null;
        }
    }

    public UUID extractDocumentId(byte[] doceoContent) {
        try {
            JsonNode manifest = extractManifest(doceoContent);
            JsonNode meta = manifest.get("meta");
            if (meta != null && meta.has("id")) {
                return UUID.fromString(meta.get("id").asText());
            }
        } catch (Exception e) {
            // ignore
        }
        return null;
    }

    private JsonNode extractManifest(byte[] doceoContent) throws Exception {
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(doceoContent))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.getName().equals("manifest.json")) {
                    byte[] manifestBytes = zis.readAllBytes();
                    return objectMapper.readTree(manifestBytes);
                }
                zis.closeEntry();
            }
        }
        throw new RuntimeException("manifest.json not found");
    }

    public String extractContentSha256FromManifest(byte[] doceoContent) {
        try {
            JsonNode manifest = extractManifest(doceoContent);
            JsonNode sha256Node = manifest.get("content_sha256");
            return sha256Node != null ? sha256Node.asText() : null;
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract content_sha256 from manifest", e);
        }
    }
}