import JSZip from 'jszip';
import type { IDoceumParser, ParseResult, SerializeInput } from '@/types/parser';

class DoceumParserService implements IDoceumParser {

    // Нормализация snake_case to camelCase
    private toCamelCase(str: string): string {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    private normalizeKeys(obj: any): any {
        if (obj === null || typeof obj !== 'object') return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => this.normalizeKeys(item));
        }

        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
            // Поле type не трогаем
            if (key === 'type') {
                result[key] = value;
            } else {
                const camelKey = this.toCamelCase(key);
                result[camelKey] = this.normalizeKeys(value);
            }
        }
        return result;
    }

    async parse(bytes: Uint8Array): Promise<ParseResult> {
        try {
            const zip = await JSZip.loadAsync(bytes);

            const manifestFile = zip.file('manifest.json');
            if (!manifestFile) {
                return { ok: false, errors: ['Missing manifest.json'] };
            }
            const manifestText = await manifestFile.async('string');
            const manifestRaw = JSON.parse(manifestText);
            const manifest = this.normalizeKeys(manifestRaw);

            const contentFile = zip.file('content.json');
            if (!contentFile) {
                return { ok: false, errors: ['Missing content.json'] };
            }
            const contentText = await contentFile.async('string');
            const contentRaw = JSON.parse(contentText);
            const content = this.normalizeKeys(contentRaw);

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

    async extractAllMedia(bytes: Uint8Array): Promise<Map<string, Uint8Array>> {
        const result = new Map<string, Uint8Array>();
        const zip = await JSZip.loadAsync(bytes);

        for (const [path, file] of Object.entries(zip.files)) {
            if (path.startsWith('media/') && !file.dir) {
                const content = await file.async('uint8array');
                result.set(path, content);
            }
        }

        return result;
    }

    async serialize(_input: SerializeInput): Promise<Uint8Array> {
        console.warn('DoceumParserService.serialize: not implemented yet');
        return new Uint8Array(0);
    }
}

export const doceumParser = new DoceumParserService();