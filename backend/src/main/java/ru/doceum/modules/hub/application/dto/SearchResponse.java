package ru.doceum.modules.hub.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class SearchResponse {
    private List<DocumentCardResponse> items;
    private PaginationInfo pagination;
}