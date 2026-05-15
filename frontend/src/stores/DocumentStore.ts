import { makeAutoObservable } from 'mobx';
import type { DocumentMetadata } from '@types/api';
import type { Block, ParsedDocument } from '@types/document';

class DocumentStore {
    // Серверный документ (по ID)
    documentId: string | null = null;
    metadata: DocumentMetadata | null = null;
    rootBlocks: Block[] = [];

    // Локальный документ (загруженный файл)
    localDocument: ParsedDocument | null = null;
    localDocumentBytes: Uint8Array | null = null;

    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    setLoading(loading: boolean) {
        this.isLoading = loading;
    }

    setError(error: string | null) {
        this.error = error;
    }

    // Серверный документ
    setDocument(documentId: string, metadata: DocumentMetadata, rootBlocks: Block[]) {
        this.documentId = documentId;
        this.metadata = metadata;
        this.rootBlocks = rootBlocks;
        this.localDocument = null;
        this.localDocumentBytes = null;
        this.error = null;
    }

    // Локальный документ
    setLocalDocument(parsed: ParsedDocument, bytes: Uint8Array) {
        this.localDocument = parsed;
        this.localDocumentBytes = bytes;
        this.documentId = null;
        this.metadata = null;
        this.rootBlocks = [];
        this.error = null;
    }

    clearLocalDocument() {
        this.localDocument = null;
        this.localDocumentBytes = null;
    }

    clear() {
        this.documentId = null;
        this.metadata = null;
        this.rootBlocks = [];
        this.localDocument = null;
        this.localDocumentBytes = null;
        this.error = null;
    }

    get hasDocument(): boolean {
        return this.documentId !== null || this.localDocument !== null;
    }

    get isLocal(): boolean {
        return this.localDocument !== null;
    }
}

export const documentStore = new DocumentStore();