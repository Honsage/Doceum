package ru.doceum.modules.profile.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FavoriteItemResponse {
    private String publicationId;
    private String documentId;
    private String title;
    private String description;
    private AuthorInfoResponse author;
    private String publishedAt;
    private String addedToFavoritesAt;
}