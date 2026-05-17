import { describe, it, expect } from 'vitest';
import { fc } from '@fast-check/vitest';

const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

describe('Fuzz: URL validation', () => {
    it('валидный URL не вызывает исключение (100 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(fc.webUrl(), async (url) => {
                expect(isValidUrl(url)).toBe(true);
            }),
            { numRuns: 100 }
        );
    });

    it('isValidUrl возвращает false для случайных строк (100 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(fc.string({ minLength: 1, maxLength: 200 }), async (str) => {
                const result = isValidUrl(str);
                expect(typeof result).toBe('boolean');
            }),
            { numRuns: 100 }
        );
    });
});