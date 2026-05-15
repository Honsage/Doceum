import { request, API_BASE } from './client';
import type { CreateDocumentRequest, CreateDocumentResponse, DocumentMetadata, VerifyResponse } from '@types/api';

export const documentsApi = {
    // Создать документ
    create: (data: CreateDocumentRequest): Promise<CreateDocumentResponse> =>
        request<CreateDocumentResponse>('/documents', {
            method: 'POST',
            body: JSON.stringify(data),
            requireAuth: true,
        }),

    // Сохранить черновик (загрузить файл)
    saveDraft: (documentId: string, file: File, token: string): Promise<Response> => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch(`${API_BASE}/documents/${documentId}/draft`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });
    },

    // Скачать черновик
    getDraft: (documentId: string, token: string): Promise<Blob> =>
        fetch(`${API_BASE}/documents/${documentId}/draft`, {
            headers: { 'Authorization': `Bearer ${token}` },
        }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.blob();
        }),

    // Опубликовать
    publish: (documentId: string): Promise<void> =>
        request<void>(`/documents/${documentId}/publish`, {
            method: 'POST',
            requireAuth: true,
        }),

    // Снять с публикации
    unpublish: (documentId: string): Promise<void> =>
        request<void>(`/documents/${documentId}/publish`, {
            method: 'DELETE',
            requireAuth: true,
        }),

    // Удалить документ
    delete: (documentId: string): Promise<void> =>
        request<void>(`/documents/${documentId}/draft`, {
            method: 'DELETE',
            requireAuth: true,
        }),

    // Просмотреть публикацию (без токена)
    view: (documentId: string): Promise<Blob> =>
        fetch(`${API_BASE}/documents/${documentId}/view`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.blob();
        }),

    // Метаданные (без токена, для публичных документов)
    getMetadata: (documentId: string): Promise<DocumentMetadata> =>
        fetch(`${API_BASE}/documents/${documentId}/metadata`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        }),

    // Метаданные (с токеном, для автора)
    getMetadataWithAuth: (documentId: string, token: string): Promise<DocumentMetadata> =>
        fetch(`${API_BASE}/documents/${documentId}/metadata`, {
            headers: { 'Authorization': `Bearer ${token}` },
        }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        }),

    // Верифицировать документ
    verify: (file: File): Promise<VerifyResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch(`${API_BASE}/documents/verify`, {
            method: 'POST',
            body: formData,
        }).then(res => res.json());
    },
};