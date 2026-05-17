import { describe, it, expect } from 'vitest';
import { fc } from '@fast-check/vitest';
import { render } from '@testing-library/react';
import { BlockRenderer } from '@components/blocks';

const blockArbitrary = fc.oneof(
    fc.record({
        id: fc.uuid(),
        type: fc.constant('heading'),
        level: fc.integer({ min: 1, max: 6 }),
        content: fc.constant({ type: 'text', inlines: [] }),
    }),
    fc.record({
        id: fc.uuid(),
        type: fc.constant('paragraph'),
        content: fc.constant({ type: 'text', inlines: [] }),
    }),
    fc.record({
        id: fc.uuid(),
        type: fc.constant('code'),
        language: fc.string({ maxLength: 20 }),
        code: fc.string({ minLength: 0, maxLength: 1000 }),
    }),
    fc.record({
        id: fc.uuid(),
        type: fc.constant('image'),
        src: fc.string(),
        alt: fc.string(),
    }),
    fc.record({
        id: fc.uuid(),
        type: fc.constant('divider'),
    }),
    fc.record({
        id: fc.uuid(),
        type: fc.constant('quote'),
        children: fc.array(fc.constant({ id: 'child1', type: 'paragraph', content: { type: 'text', inlines: [] } }), { maxLength: 3 }),
    }),
);

const getMediaUrlStub = () => '';

describe('Fuzz: BlockRenderer', () => {
    it('не падает при любых блоках (100 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(blockArbitrary, async (block) => {
                expect(() => {
                    render(
                        <BlockRenderer
                            block={block}
                            getMediaUrl={getMediaUrlStub}
                        />
                    );
                }).not.toThrow();
            }),
            { numRuns: 100, timeout: 30000 }
        );
    });
});