// Auth types

export interface User {
    id: string;
    email: string;
    role: 'READER' | 'AUTHOR' | 'ADMIN';
    surname: string;
    name: string;
    patronymic?: string;
    organization?: string;
    position?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RegisterRequest {
    email: string;
    password: string;
    role: 'READER' | 'AUTHOR';
    surname: string;
    name: string;
    patronymic?: string;
    organization?: string;
    position?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

// Documents types

export interface CreateDocumentRequest {
    title: string;
    description: string;
}

export interface CreateDocumentResponse {
    id: string;
}

export interface AuthorInfo {
    id: string;
    fullName: string;
}

export interface DocumentMetadata {
    id: string;
    title: string;
    description: string;
    author: AuthorInfo;
    status: string;
    publishedAt: string | null;
    updatedAt: string;
    contentSha256?: string;
    hasSignature?: boolean;
}

export interface VerifyResponse {
    verified: boolean;
    reason: 'verified' | 'unsigned' | 'tampered' | 'error';
    documentId?: string;
    title?: string;
    authorName?: string;
}

// Hub types

export interface PaginationInfo {
    total: number;
    limit: number;
    offset: number;
    nextOffset: number | null;
}

export interface SearchResponse<T> {
    items: T[];
    pagination: PaginationInfo;
}

// Profile types

export interface FavoriteItem {
    publicationId: string;
    documentId: string;
    title: string;
    description: string;
    author: AuthorInfo;
    publishedAt: string;
    addedToFavoritesAt: string;
}

export interface DraftItem {
    documentId: string;
    title: string;
    description: string;
    status: string;
    updatedAt: string;
    createdAt: string;
}

export interface PublishedItem {
    documentId: string;
    title: string;
    description: string;
    status: string;
    publishedAt: string;
    updatedAt: string;
    createdAt: string;
}