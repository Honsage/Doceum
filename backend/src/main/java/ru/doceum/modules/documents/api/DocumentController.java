package ru.doceum.modules.documents.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.doceum.modules.documents.application.dto.CreateDocumentRequest;
import ru.doceum.modules.documents.application.dto.DocumentMetadataResponse;
import ru.doceum.modules.documents.application.dto.VerifyResponse;
import ru.doceum.modules.documents.application.services.DocumentApplicationService;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentApplicationService documentService;

    @PostMapping
    public ResponseEntity<UUID> createDocument(
            @RequestAttribute("userId") String userId,
            @Valid @RequestBody CreateDocumentRequest request) {
        UUID documentId = documentService.createDocument(UUID.fromString(userId), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(documentId);
    }

    @PutMapping("/{id}/draft")
    public ResponseEntity<Void> saveDraft(
            @PathVariable UUID id,
            @RequestAttribute("userId") String userId,
            @RequestParam("file") MultipartFile file) {
        try {
            documentService.saveDraft(id, UUID.fromString(userId), file);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/draft")
    public ResponseEntity<byte[]> getDraft(
            @PathVariable UUID id,
            @RequestAttribute("userId") String userId) {
        byte[] content = documentService.getDraftFile(id, UUID.fromString(userId));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + id + ".doceo\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }

    @DeleteMapping("/{id}/draft")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID id,
            @RequestAttribute("userId") String userId) {
        documentService.deleteDocument(id, UUID.fromString(userId));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<Void> publish(
            @PathVariable UUID id,
            @RequestAttribute("userId") String userId) {
        documentService.publish(id, UUID.fromString(userId));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/publish")
    public ResponseEntity<Void> unpublish(
            @PathVariable UUID id,
            @RequestAttribute("userId") String userId) {
        documentService.unpublish(id, UUID.fromString(userId));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<byte[]> viewPublication(@PathVariable UUID id) {
        byte[] content = documentService.getPublicationFile(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + id + ".doceo\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }

    @GetMapping("/{id}/metadata")
    public ResponseEntity<DocumentMetadataResponse> getMetadata(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getMetadata(id));
    }

    @PostMapping("/verify")
    public ResponseEntity<VerifyResponse> verify(@RequestParam("file") MultipartFile file) {
        try {
            VerifyResponse response = documentService.verify(file.getBytes());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(new VerifyResponse(false, "error", null, null, null));
        }
    }
}