import { request, API_BASE } from './client';
import type { CreateDocumentRequest, CreateDocumentResponse, DocumentMetadata, VerifyResponse } from '@types/api';

export const documentsApi = {
    create: (data: CreateDocumentRequest): Promise<CreateDocumentResponse> =>
        request<CreateDocumentResponse>('/documents', {
            method: 'POST',
            body: JSON.stringify(data),
            requireAuth: true,
        }),

    saveDraft: async (documentId: string, file: File): Promise<boolean> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/documents/${documentId}/draft`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: formData,
        });

        return response.ok;
    },

    getDraft: async (documentId: string): Promise<Uint8Array> => {
        const response = await fetch(`${API_BASE}/documents/${documentId}/draft`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        return new Uint8Array(await blob.arrayBuffer());
    },

    publish: (documentId: string): Promise<void> =>
        request<void>(`/documents/${documentId}/publish`, {
            method: 'POST',
            requireAuth: true,
        }),

    unpublish: (documentId: string): Promise<void> =>
        request<void>(`/documents/${documentId}/publish`, {
            method: 'DELETE',
            requireAuth: true,
        }),

    delete: (documentId: string): Promise<void> =>
        request<void>(`/documents/${documentId}/draft`, {
            method: 'DELETE',
            requireAuth: true,
        }),

    view: (documentId: string): Promise<Blob> =>
        fetch(`${API_BASE}/documents/${documentId}/view`).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.blob();
        }),

    getMetadata: (documentId: string): Promise<DocumentMetadata> =>
        fetch(`${API_BASE}/documents/${documentId}/metadata`).then(res => res.json()),

    getMetadataWithAuth: (documentId: string): Promise<DocumentMetadata> =>
        request<DocumentMetadata>(`/documents/${documentId}/metadata`, {
            method: 'GET',
            requireAuth: true,
        }),

    updateMetadata: async (documentId: string, title: string, description: string): Promise<boolean> => {
        const response = await fetch(`${API_BASE}/documents/${documentId}/metadata`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({ title, description }),
        });

        return response.ok;
    },

    verify: (file: File): Promise<VerifyResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch(`${API_BASE}/documents/verify`, {
            method: 'POST',
            body: formData,
        }).then(res => res.json());
    },
};