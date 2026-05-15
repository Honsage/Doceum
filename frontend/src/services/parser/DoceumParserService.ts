import JSZip from 'jszip';
import type { IDoceumParser, ParseResult, SerializeInput } from '@/types/parser';

// Нормализация ключей: snake_case -> camelCase
const toCamelCase = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const normalizeKeys = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => normalizeKeys(item));
    }

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        // Пропускаем нормализацию для поля type
        if (key === 'type') {
            result[key] = value;
        } else {
            const camelKey = toCamelCase(key);
            result[camelKey] = normalizeKeys(value);
        }
    }
    return result;
};

class DoceumParserService implements IDoceumParser {

    async parse(bytes: Uint8Array): Promise<ParseResult> {
        try {
            const zip = await JSZip.loadAsync(bytes);

            const manifestFile = zip.file('manifest.json');
            if (!manifestFile) {
                return { ok: false, errors: ['Missing manifest.json'] };
            }
            const manifestText = await manifestFile.async('string');
            const manifestRaw = JSON.parse(manifestText);
            const manifest = normalizeKeys(manifestRaw);

            const contentFile = zip.file('content.json');
            if (!contentFile) {
                return { ok: false, errors: ['Missing content.json'] };
            }
            const contentText = await contentFile.async('string');
            const contentRaw = JSON.parse(contentText);
            const content = normalizeKeys(contentRaw);

            if (!content.root || !Array.isArray(content.root)) {
                return { ok: false, errors: ['Invalid content.json: missing root array'] };
            }

            return {
                ok: true,
                manifest: {
                    id: manifest.meta?.id,
                    title: manifest.meta?.title,
                    authorId: manifest.meta?.authorId,
                    createdAt: manifest.meta?.createdAt,
                    updatedAt: manifest.meta?.updatedAt,
                    contentSha256: manifest.contentSha256 || '',
                    hasSignature: !!manifest.signature,
                },
                content: {
                    root: content.root,
                },
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown parse error';
            return { ok: false, errors: [message] };
        }
    }

    async extractMedia(bytes: Uint8Array, path: string): Promise<Uint8Array | null> {
        try {
            const zip = await JSZip.loadAsync(bytes);
            const file = zip.file(path);
            if (!file) return null;
            return await file.async('uint8array');
        } catch {
            return null;
        }
    }

    async serialize(_input: SerializeInput): Promise<Uint8Array> {
        console.warn('DoceumParserService.serialize: not implemented yet');
        return new Uint8Array(0);
    }
}

export const doceumParser = new DoceumParserService();