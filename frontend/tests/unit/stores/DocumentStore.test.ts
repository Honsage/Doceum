import { describe, it, expect, beforeEach } from 'vitest';
import { documentStore } from '@stores/DocumentStore';

describe('DocumentStore', () => {
    beforeEach(() => {
        documentStore.clear();
    });

    it('начальное состояние', () => {
        expect(documentStore.hasDocument).toBe(false);
        expect(documentStore.isLoading).toBe(false);
        expect(documentStore.error).toBeNull();
    });

    it('setDocument сохраняет документ', () => {
        const metadata = {
            id: 'doc-1',
            title: 'Test Doc',
            description: 'Test Description',
            author: { id: 'user-1', fullName: 'Test User' },
            status: 'PUBLISHED',
            publishedAt: null,
            updatedAt: '2024-01-01',
        };
        const rootBlocks = [{ id: 'block-1', type: 'paragraph' }];

        documentStore.setDocument('doc-1', metadata, rootBlocks);

        expect(documentStore.hasDocument).toBe(true);
        expect(documentStore.metadata).toEqual(metadata);
        expect(documentStore.rootBlocks).toEqual(rootBlocks);
    });

    it('clearDocument очищает документ', () => {
        documentStore.setDocument('doc-1', {} as any, []);
        documentStore.clear();

        expect(documentStore.hasDocument).toBe(false);
        expect(documentStore.metadata).toBeNull();
        expect(documentStore.rootBlocks).toEqual([]);
    });
});