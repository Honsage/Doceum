package ru.doceum.modules.profile.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class ProfileResponse<T> {
    private List<T> items;
    private PaginationInfo pagination;
}