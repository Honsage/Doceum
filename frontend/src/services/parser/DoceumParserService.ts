import JSZip from 'jszip';
import type { IDoceumParser, ParseResult, SerializeInput } from '@types/parser';

class DoceumParserService implements IDoceumParser {

    async parse(bytes: Uint8Array): Promise<ParseResult> {
        try {
            const zip = await JSZip.loadAsync(bytes);

            // Проверяем manifest.json
            const manifestFile = zip.file('manifest.json');
            if (!manifestFile) {
                return { ok: false, errors: ['Missing manifest.json'] };
            }
            const manifestText = await manifestFile.async('string');
            const manifest = JSON.parse(manifestText);

            // Проверяем content.json
            const contentFile = zip.file('content.json');
            if (!contentFile) {
                return { ok: false, errors: ['Missing content.json'] };
            }
            const contentText = await contentFile.async('string');
            const content = JSON.parse(contentText);

            // Проверяем структуру
            if (!content.root || !Array.isArray(content.root)) {
                return { ok: false, errors: ['Invalid content.json: missing root array'] };
            }

            return {
                ok: true,
                manifest: {
                    id: manifest.meta?.id,
                    title: manifest.meta?.title,
                    authorId: manifest.meta?.author_id,
                    createdAt: manifest.meta?.created_at,
                    updatedAt: manifest.meta?.updated_at,
                    contentSha256: manifest.content_sha256 || '',
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
        // TODO: реализовать для Studio
        console.warn('DoceumParserService.serialize: not implemented yet');
        return new Uint8Array(0);
    }
}

export const doceumParser = new DoceumParserService();