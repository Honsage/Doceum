package ru.doceum.modules.profile.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.doceum.modules.profile.application.dto.ProfileResponse;
import ru.doceum.modules.profile.application.dto.FavoriteItemResponse;
import ru.doceum.modules.profile.application.dto.DraftItemResponse;
import ru.doceum.modules.profile.application.dto.PublishedItemResponse;
import ru.doceum.modules.profile.application.services.ProfileApplicationService;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileApplicationService profileService;

    // === Избранное ===

    @GetMapping("/favorites")
    public ResponseEntity<ProfileResponse<FavoriteItemResponse>> getFavorites(
            @RequestAttribute("userId") String userId,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        return ResponseEntity.ok(profileService.getFavorites(UUID.fromString(userId), limit, offset));
    }

    @PostMapping("/favorites/{publicationId}")
    public ResponseEntity<Void> addToFavorites(
            @RequestAttribute("userId") String userId,
            @PathVariable UUID publicationId) {
        profileService.addToFavorites(UUID.fromString(userId), publicationId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/favorites/{publicationId}")
    public ResponseEntity<Void> removeFromFavorites(
            @RequestAttribute("userId") String userId,
            @PathVariable UUID publicationId) {
        profileService.removeFromFavorites(UUID.fromString(userId), publicationId);
        return ResponseEntity.noContent().build();
    }

    // === Черновики автора ===

    @GetMapping("/documents/drafts")
    public ResponseEntity<ProfileResponse<DraftItemResponse>> getDrafts(
            @RequestAttribute("userId") String userId,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        return ResponseEntity.ok(profileService.getDrafts(UUID.fromString(userId), limit, offset));
    }

    // === Опубликованные документы автора ===

    @GetMapping("/documents/published")
    public ResponseEntity<ProfileResponse<PublishedItemResponse>> getPublishedDocuments(
            @RequestAttribute("userId") String userId,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        return ResponseEntity.ok(profileService.getPublishedDocuments(UUID.fromString(userId), limit, offset));
    }
}