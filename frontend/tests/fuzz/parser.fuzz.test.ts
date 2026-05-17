import { describe, it, expect } from 'vitest';
import { fc } from '@fast-check/vitest';
import { doceumParser } from '@services/parser';

describe('Fuzz: DoceumParser', () => {
    it('parse не падает на любых бинарных данных (50 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(fc.uint8Array({ minLength: 0, maxLength: 10000 }), async (bytes) => {
                const result = await doceumParser.parse(bytes);

                expect(result).toHaveProperty('ok');
                expect(typeof result.ok).toBe('boolean');

                if (!result.ok) {
                    expect(result.errors).toBeInstanceOf(Array);
                }
            }),
            { numRuns: 50, timeout: 60000 }
        );
    });

    it('parse не падает на пустых данных', async () => {
        const result = await doceumParser.parse(new Uint8Array(0));
        expect(result).toHaveProperty('ok');
        expect(result.ok).toBe(false);
    });
});