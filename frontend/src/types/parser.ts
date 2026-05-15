export interface ParseResult {
    ok: boolean;
    manifest?: {
        id: string;
        title: string;
        authorId: string;
        createdAt: string;
        updatedAt: string;
        contentSha256: string;
        hasSignature: boolean;
    };
    content?: {
        root: unknown[];
    };
    errors?: string[];
}

export interface SerializeInput {
    manifest: {
        id: string;
        title: string;
        authorId: string;
    };
    content: {
        root: unknown[];
    };
    media?: Array<{
        path: string;
        content: Uint8Array;
    }>;
}

export interface IDoceumParser {
    parse(bytes: Uint8Array): Promise<ParseResult>;
    extractMedia(bytes: Uint8Array, path: string): Promise<Uint8Array | null>;
    serialize(input: SerializeInput): Promise<Uint8Array>;
}