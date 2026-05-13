package ru.doceum.common.ports.documents;

public record DocumentFile(
        byte[] content,
        String filename,
        String contentType
) {}
