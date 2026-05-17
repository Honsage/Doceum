import { describe, it, expect } from 'vitest';
import { fc } from '@fast-check/vitest';
import { render } from '@testing-library/react';
import { InlineRenderer } from '@components/inline';

// Генератор InlineNode (без рекурсии)
const inlineNodeArbitrary = fc.oneof(
    fc.record({
        type: fc.constant('span'),
        text: fc.string({ minLength: 0, maxLength: 100 }),
        marks: fc.array(fc.constantFrom('bold', 'italic', 'underline', 'strikethrough'), { maxLength: 4 }),
    }),
    fc.record({
        type: fc.constant('inline_code'),
        code: fc.string({ minLength: 0, maxLength: 50 }),
    }),
    fc.record({
        type: fc.constant('copy_snippet'),
        text: fc.string({ minLength: 0, maxLength: 100 }),
    }),
    fc.record({
        type: fc.constant('link'),
        href: fc.webUrl(),
        content: fc.array(fc.constant({ type: 'span', text: 'link text', marks: [] }), { maxLength: 3 }),
    }),
    fc.record({
        type: fc.constant('anchor_link'),
        targetId: fc.uuid(),
        content: fc.array(fc.constant({ type: 'span', text: 'anchor text', marks: [] }), { maxLength: 3 }),
    }),
);

describe('Fuzz: InlineRenderer', () => {
    it('не падает при любых InlineNode (100 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(fc.array(inlineNodeArbitrary, { maxLength: 50 }), async (nodes) => {
                expect(() => {
                    render(<InlineRenderer nodes={nodes} />);
                }).not.toThrow();
            }),
            { numRuns: 100, timeout: 30000 }
        );
    });

    it('не падает при очень длинных текстах (50 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(fc.string({ minLength: 1000, maxLength: 5000 }), async (longText) => {
                const nodes = [{ type: 'span', text: longText, marks: [] }];
                expect(() => {
                    render(<InlineRenderer nodes={nodes} />);
                }).not.toThrow();
            }),
            { numRuns: 50, timeout: 30000 }
        );
    });
});