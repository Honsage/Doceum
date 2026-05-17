import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlockRenderer } from '@components/blocks';

const getMediaUrlStub = () => '';

describe('BlockRenderer', () => {
    it('рендерит заголовок', () => {
        const block = {
            id: '1',
            type: 'heading',
            level: 1,
            content: { type: 'text', inlines: [{ type: 'span', text: 'Hello', marks: [] }] },
        };

        render(<BlockRenderer block={block as any} getMediaUrl={getMediaUrlStub} />);
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('рендерит параграф', () => {
        const block = {
            id: '1',
            type: 'paragraph',
            content: { type: 'text', inlines: [{ type: 'span', text: 'Paragraph text', marks: [] }] },
        };

        render(<BlockRenderer block={block as any} getMediaUrl={getMediaUrlStub} />);
        expect(screen.getByText('Paragraph text')).toBeInTheDocument();
    });

    it('рендерит код', () => {
        const block = {
            id: '1',
            type: 'code',
            language: 'javascript',
            code: 'console.log("hello");',
        };

        render(<BlockRenderer block={block as any} getMediaUrl={getMediaUrlStub} />);
        expect(screen.getByText('console.log("hello");')).toBeInTheDocument();
    });

    it('рендерит разделитель', () => {
        const block = { id: '1', type: 'divider' };
        render(<BlockRenderer block={block as any} getMediaUrl={getMediaUrlStub} />);
        expect(document.querySelector('hr')).toBeInTheDocument();
    });

    it('показывает заглушку для неизвестного типа', () => {
        const block = { id: '1', type: 'unknown' };
        render(<BlockRenderer block={block as any} getMediaUrl={getMediaUrlStub} />);
        expect(screen.getByText(/неизвестный блок/i)).toBeInTheDocument();
    });
});