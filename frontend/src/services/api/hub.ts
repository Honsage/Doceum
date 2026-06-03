import { request } from './client';
import type { DocumentMetadata, SearchResponse } from '@types/api';

export const hubApi = {
    // Последние публикации
    getRecent: (limit: number = 20, offset: number = 0): Promise<SearchResponse<DocumentMetadata>> =>
        request<SearchResponse<DocumentMetadata>>(
            `/hub/recent?limit=${limit}&offset=${offset}`,
            { requireAuth: false }
        ),

    // Поиск по названию
    searchByTitle: (query: string, limit: number = 20, offset: number = 0): Promise<SearchResponse<DocumentMetadata>> =>
        request<SearchResponse<DocumentMetadata>>(
            `/hub/documents?search=${encodeURIComponent(query)}&type=title&limit=${limit}&offset=${offset}`,
            { requireAuth: false }
        ),

    // Поиск по автору
    searchByAuthor: (query: string, limit: number = 20, offset: number = 0): Promise<SearchResponse<DocumentMetadata>> =>
        request<SearchResponse<DocumentMetadata>>(
            `/hub/documents?search=${encodeURIComponent(query)}&type=author&limit=${limit}&offset=${offset}`,
            { requireAuth: false }
        ),

    // Карточка документа
    getDocumentCard: (documentId: string): Promise<DocumentMetadata> =>
        request<DocumentMetadata>(`/hub/documents/${documentId}`, { requireAuth: false }),
};