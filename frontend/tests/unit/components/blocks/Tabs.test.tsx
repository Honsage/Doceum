import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@components/blocks';

const getMediaUrlStub = () => '';

describe('Tabs', () => {
    const mockTabs = {
        id: 'tabs1',
        type: 'tabs' as const,
        children: [
            {
                id: 'tab1',
                type: 'tab_item' as const,
                label: { type: 'text' as const, inlines: [{ type: 'span' as const, text: 'Tab 1', marks: [] }] },
                children: [{ id: 'p1', type: 'paragraph' as const, content: { type: 'text' as const, inlines: [{ type: 'span' as const, text: 'Content 1', marks: [] }] } }],
            },
            {
                id: 'tab2',
                type: 'tab_item' as const,
                label: { type: 'text' as const, inlines: [{ type: 'span' as const, text: 'Tab 2', marks: [] }] },
                children: [{ id: 'p2', type: 'paragraph' as const, content: { type: 'text' as const, inlines: [{ type: 'span' as const, text: 'Content 2', marks: [] }] } }],
            },
        ],
    };

    it('рендерит заголовки вкладок', () => {
        render(<Tabs block={mockTabs as any} getMediaUrl={getMediaUrlStub} />);
        expect(screen.getByText('Tab 1')).toBeInTheDocument();
        expect(screen.getByText('Tab 2')).toBeInTheDocument();
    });

    it('показывает первую вкладку по умолчанию', () => {
        render(<Tabs block={mockTabs as any} getMediaUrl={getMediaUrlStub} />);
        expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('переключает вкладку по клику', async () => {
        const user = userEvent.setup();
        render(<Tabs block={mockTabs as any} getMediaUrl={getMediaUrlStub} />);

        expect(screen.getByText('Content 1')).toBeInTheDocument();
        expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

        await user.click(screen.getByText('Tab 2'));

        expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
        expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
});