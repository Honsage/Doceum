package ru.doceum.modules.hub.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.doceum.modules.hub.application.dto.SearchResponse;
import ru.doceum.modules.hub.application.dto.DocumentCardResponse;
import ru.doceum.modules.hub.application.services.HubApplicationService;

import java.util.UUID;

@RestController
@RequestMapping("/api/hub")
@RequiredArgsConstructor
public class HubController {

    private final HubApplicationService hubService;

    @GetMapping("/recent")
    public ResponseEntity<SearchResponse> getRecent(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        return ResponseEntity.ok(hubService.getRecentDocuments(limit, offset));
    }

    @GetMapping("/documents")
    public ResponseEntity<SearchResponse> search(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "title") String type,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {

        if (search == null || search.isBlank()) {
            // Без поиска — просто последние
            return ResponseEntity.ok(hubService.getRecentDocuments(limit, offset));
        }

        if ("author".equalsIgnoreCase(type)) {
            return ResponseEntity.ok(hubService.searchByAuthor(search, limit, offset));
        } else {
            // По умолчанию поиск по названию
            return ResponseEntity.ok(hubService.searchByTitle(search, limit, offset));
        }
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<DocumentCardResponse> getDocumentCard(@PathVariable UUID id) {
        return ResponseEntity.ok(hubService.getDocumentCard(id));
    }
}