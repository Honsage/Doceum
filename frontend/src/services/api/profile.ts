import { request } from './client';
import type { FavoriteItem, DraftItem, PublishedItem, SearchResponse } from '@types/api';

export const profileApi = {
    // Избранное

    getFavorites: (limit: number = 20, offset: number = 0): Promise<SearchResponse<FavoriteItem>> =>
        request<SearchResponse<FavoriteItem>>(
            `/profile/favorites?limit=${limit}&offset=${offset}`,
            { requireAuth: true }
        ),

    addToFavorites: (publicationId: string): Promise<void> =>
        request<void>(`/profile/favorites/${publicationId}`, {
            method: 'POST',
            requireAuth: true,
        }),

    removeFromFavorites: (publicationId: string): Promise<void> =>
        request<void>(`/profile/favorites/${publicationId}`, {
            method: 'DELETE',
            requireAuth: true,
        }),

    // Мои документы

    getDrafts: (limit: number = 20, offset: number = 0): Promise<SearchResponse<DraftItem>> =>
        request<SearchResponse<DraftItem>>(
            `/profile/documents/drafts?limit=${limit}&offset=${offset}`,
            { requireAuth: true }
        ),

    getPublished: (limit: number = 20, offset: number = 0): Promise<SearchResponse<PublishedItem>> =>
        request<SearchResponse<PublishedItem>>(
            `/profile/documents/published?limit=${limit}&offset=${offset}`,
            { requireAuth: true }
        ),
};