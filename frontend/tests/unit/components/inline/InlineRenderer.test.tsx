import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InlineRenderer } from '@components/inline';

describe('InlineRenderer', () => {
    it('рендерит обычный текст', () => {
        const nodes = [{ type: 'span', text: 'Hello World', marks: [] }];
        render(<InlineRenderer nodes={nodes} />);
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('рендерит жирный текст', () => {
        const nodes = [{ type: 'span', text: 'Bold', marks: ['bold'] }];
        render(<InlineRenderer nodes={nodes} />);
        const element = screen.getByText('Bold');
        expect(element.tagName).toBe('STRONG');
    });

    it('рендерит курсив', () => {
        const nodes = [{ type: 'span', text: 'Italic', marks: ['italic'] }];
        render(<InlineRenderer nodes={nodes} />);
        const element = screen.getByText('Italic');
        expect(element.tagName).toBe('EM');
    });

    it('рендерит подчёркнутый текст', () => {
        const nodes = [{ type: 'span', text: 'Underline', marks: ['underline'] }];
        render(<InlineRenderer nodes={nodes} />);
        const element = screen.getByText('Underline');
        expect(element.tagName).toBe('U');
    });

    it('рендерит зачёркнутый текст', () => {
        const nodes = [{ type: 'span', text: 'Strikethrough', marks: ['strikethrough'] }];
        render(<InlineRenderer nodes={nodes} />);
        const element = screen.getByText('Strikethrough');
        expect(element.tagName).toBe('S');
    });

    it('рендерит инлайн-код', () => {
        const nodes = [{ type: 'inline_code', code: 'console.log()' }];
        render(<InlineRenderer nodes={nodes} />);
        expect(screen.getByText('console.log()')).toBeInTheDocument();
    });

    it('рендерит ссылку', () => {
        const nodes = [{
            type: 'link',
            href: 'https://example.com',
            content: [{ type: 'span', text: 'Click me', marks: [] }],
        }];
        render(<InlineRenderer nodes={nodes} />);

        // Ищем ссылку по атрибуту href
        const link = screen.getByRole('link', { name: 'Click me' });
        expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('рендерит якорную ссылку', () => {
        const handleClick = vi.fn();
        const nodes = [{
            type: 'anchor_link',
            target_id: 'section-1',
            content: [{ type: 'span', text: 'Go to section', marks: [] }],
        }];
        const { container } = render(<InlineRenderer nodes={nodes} onAnchorClick={handleClick} />);

        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button?.textContent).toBe('Go to section');
        button?.click();
    });

    it('возвращает null при пустых nodes', () => {
        const { container } = render(<InlineRenderer nodes={[]} />);
        expect(container.innerHTML).toBe('');
    });
});