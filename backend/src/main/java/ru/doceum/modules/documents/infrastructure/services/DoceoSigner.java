package ru.doceum.modules.documents.infrastructure.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoceoSigner {

    private final ObjectMapper objectMapper;

    @Value("${doceum.signing.secret:defaultSecretKeyForDevOnly}")
    private String signingSecret;

    public byte[] sign(byte[] unsignedDoceo) {
        try {
            // 1. Распаковываем и извлекаем manifest
            ManifestData manifestData = extractManifestAndAssets(unsignedDoceo);

            // 2. Вычисляем подпись
            String signature = calculateHmacSignature(manifestData);

            // 3. Обновляем manifest с подписью
            byte[] updatedManifest = addSignatureToManifest(manifestData.manifestBytes, signature);

            // 4. Собираем обратно ZIP с обновлённым manifest
            return rebuildZip(unsignedDoceo, updatedManifest);

        } catch (Exception e) {
            throw new RuntimeException("Failed to sign .doceo", e);
        }
    }

    public String extractSignature(byte[] signedDoceo) {
        try {
            JsonNode manifest = extractManifestFromBytes(signedDoceo);
            JsonNode signatureNode = manifest.get("signature");
            return signatureNode != null ? signatureNode.asText() : null;
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract signature", e);
        }
    }

    public boolean verifySignature(byte[] doceoContent) {
        try {
            ManifestData manifestData = extractManifestAndAssets(doceoContent);

            String existingSignature = extractSignature(doceoContent);
            if (existingSignature == null) {
                return false;
            }

            // Удаляем подпись из manifest для вычисления
            byte[] manifestWithoutSignature = removeSignatureFromManifest(manifestData.manifestBytes);
            String calculatedSignature = calculateHmacSignature(
                    manifestWithoutSignature,
                    manifestData.contentSha256,
                    manifestData.assetHashes
            );

            return calculatedSignature.equals(existingSignature);

        } catch (Exception e) {
            log.error("Signature verification failed", e);
            return false;
        }
    }

    private String calculateHmacSignature(ManifestData data) throws Exception {
        return calculateHmacSignature(data.manifestBytes, data.contentSha256, data.assetHashes);
    }

    private String calculateHmacSignature(byte[] manifestBytes, String contentSha256, List<String> assetHashes) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(signingSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(keySpec);

        mac.update(manifestBytes);
        mac.update(contentSha256.getBytes(StandardCharsets.UTF_8));
        for (String assetHash : assetHashes) {
            mac.update(assetHash.getBytes(StandardCharsets.UTF_8));
        }

        byte[] signatureBytes = mac.doFinal();
        StringBuilder hexString = new StringBuilder();
        for (byte b : signatureBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }

        return "HS256:" + hexString.toString();
    }

    private ManifestData extractManifestAndAssets(byte[] doceoContent) throws Exception {
        ByteArrayInputStream bais = new ByteArrayInputStream(doceoContent);
        ZipInputStream zis = new ZipInputStream(bais);

        byte[] manifestBytes = null;
        String contentSha256 = null;
        List<String> assetHashes = new ArrayList<>();

        ZipEntry entry;
        while ((entry = zis.getNextEntry()) != null) {
            String name = entry.getName();
            byte[] content = zis.readAllBytes();

            if (name.equals("manifest.json")) {
                manifestBytes = content;
            } else if (name.equals("content.json")) {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(content);
                StringBuilder hexString = new StringBuilder();
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) hexString.append('0');
                    hexString.append(hex);
                }
                contentSha256 = hexString.toString();
            } else if (name.startsWith("media/")) {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(content);
                StringBuilder hexString = new StringBuilder();
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) hexString.append('0');
                    hexString.append(hex);
                }
                assetHashes.add(hexString.toString());
            }

            zis.closeEntry();
        }
        zis.close();

        if (manifestBytes == null || contentSha256 == null) {
            throw new RuntimeException("Invalid .doceo: missing manifest or content");
        }

        return new ManifestData(manifestBytes, contentSha256, assetHashes);
    }

    private byte[] addSignatureToManifest(byte[] manifestBytes, String signature) throws Exception {
        JsonNode manifestNode = objectMapper.readTree(manifestBytes);
        ((ObjectNode) manifestNode).put("signature", signature);
        return objectMapper.writeValueAsBytes(manifestNode);
    }

    private byte[] removeSignatureFromManifest(byte[] manifestBytes) throws Exception {
        JsonNode manifestNode = objectMapper.readTree(manifestBytes);
        if (manifestNode.has("signature")) {
            ((ObjectNode) manifestNode).remove("signature");
        }
        return objectMapper.writeValueAsBytes(manifestNode);
    }

    private JsonNode extractManifestFromBytes(byte[] doceoContent) throws Exception {
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(doceoContent))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.getName().equals("manifest.json")) {
                    return objectMapper.readTree(zis.readAllBytes());
                }
                zis.closeEntry();
            }
        }
        throw new RuntimeException("manifest.json not found");
    }

    private byte[] rebuildZip(byte[] originalZip, byte[] newManifest) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ZipOutputStream zos = new ZipOutputStream(baos);

        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(originalZip))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                String name = entry.getName();
                byte[] content = zis.readAllBytes();

                if (name.equals("manifest.json")) {
                    zos.putNextEntry(new ZipEntry(name));
                    zos.write(newManifest);
                } else {
                    zos.putNextEntry(new ZipEntry(name));
                    zos.write(content);
                }
                zos.closeEntry();
                zis.closeEntry();
            }
        }

        zos.finish();
        return baos.toByteArray();
    }

    public byte[] prepareForPublication(byte[] draftDoceo) {
        try {
            // 1. Извлекаем manifest и content
            ManifestData manifestData = extractManifestAndAssets(draftDoceo);

            // 2. Обновляем manifest (content_sha256, updated_at)
            byte[] updatedManifest = updateManifestForPublication(
                    manifestData.manifestBytes,
                    manifestData.contentSha256
            );

            // 3. Собираем ZIP с обновлённым manifest
            byte[] updatedDoceo = rebuildZip(draftDoceo, updatedManifest);

            // 4. Подписываем обновлённый документ
            return sign(updatedDoceo);

        } catch (Exception e) {
            throw new RuntimeException("Failed to prepare document for publication", e);
        }
    }

    private byte[] updateManifestForPublication(byte[] manifestBytes, String contentSha256) throws Exception {
        JsonNode manifestNode = objectMapper.readTree(manifestBytes);
        ObjectNode meta = (ObjectNode) manifestNode.get("meta");

        // Обновляем updated_at
        meta.put("updated_at", Instant.now().toString());

        // Обновляем content_sha256 (если есть поле)
        ((ObjectNode) manifestNode).put("content_sha256", contentSha256);

        // Удаляем старую подпись, если есть
        if (manifestNode.has("signature")) {
            ((ObjectNode) manifestNode).remove("signature");
        }

        return objectMapper.writeValueAsBytes(manifestNode);
    }

    private record ManifestData(byte[] manifestBytes, String contentSha256, List<String> assetHashes) {}
}