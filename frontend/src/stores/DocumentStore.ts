import { makeAutoObservable, runInAction } from 'mobx';
import type { DocumentMetadata } from '@types/api';

// Временный тип для блоков (позже расширим)
export interface Block {
    id: string;
    type: string;
    [key: string]: unknown;
}

class DocumentStore {
    // Текущий документ
    documentId: string | null = null;
    metadata: DocumentMetadata | null = null;
    rootBlocks: Block[] = [];
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    setLoading(loading: boolean): void {
        this.isLoading = loading;
    }

    setError(error: string | null): void {
        this.error = error;
    }

    setDocument(documentId: string, metadata: DocumentMetadata, rootBlocks: Block[]): void {
        this.documentId = documentId;
        this.metadata = metadata;
        this.rootBlocks = rootBlocks;
        this.error = null;
    }

    clearDocument(): void {
        this.documentId = null;
        this.metadata = null;
        this.rootBlocks = [];
        this.error = null;
    }

    updateRootBlocks(blocks: Block[]): void {
        this.rootBlocks = blocks;
    }

    get hasDocument(): boolean {
        return this.documentId !== null && this.metadata !== null;
    }
}

export const documentStore = new DocumentStore();