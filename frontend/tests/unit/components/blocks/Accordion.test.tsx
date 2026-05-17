import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from '@components/blocks';

const getMediaUrlStub = () => '';

describe('Accordion', () => {
    const mockAccordion = {
        id: 'acc1',
        type: 'accordion' as const,
        label: { type: 'text' as const, inlines: [{ type: 'span' as const, text: 'Click to expand', marks: [] }] },
        children: [
            { id: 'p1', type: 'paragraph' as const, content: { type: 'text' as const, inlines: [{ type: 'span' as const, text: 'Hidden content', marks: [] }] } },
        ],
    };

    it('рендерит заголовок аккордеона', () => {
        render(<Accordion block={mockAccordion as any} getMediaUrl={getMediaUrlStub} />);
        expect(screen.getByText('Click to expand')).toBeInTheDocument();
    });

    it('раскрывается по клику', async () => {
        const user = userEvent.setup();
        render(<Accordion block={mockAccordion as any} getMediaUrl={getMediaUrlStub} />);

        await user.click(screen.getByText('Click to expand'));

        expect(screen.getByText('Hidden content')).toBeVisible();
    });
});

