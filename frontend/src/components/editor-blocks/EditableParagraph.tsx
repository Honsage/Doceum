import { observer } from 'mobx-react-lite';
import { RichTextEditor } from '@pages/editor/components/RichTextEditor';
import type { ParagraphBlock, InlineNode } from '@types/document';
import styles from './EditableParagraph.module.css';

interface EditableParagraphProps {
    block: ParagraphBlock;
    onUpdate: (updates: Partial<ParagraphBlock>) => void;
}

// Конвертация .doceo → TipTap
const convertToTipTap = (content: any): any => {
    const inlines = content?.inlines || [];

    // Если нет контента, возвращаем пустой параграф
    if (inlines.length === 0) {
        return {
            type: 'doc',
            content: [{ type: 'paragraph' }],
        };
    }

    const paragraphContent = inlines.map((inline: InlineNode) => {
        if (inline.type === 'span') {
            const marks: any[] = [];
            if (inline.marks?.includes('bold')) marks.push({ type: 'bold' });
            if (inline.marks?.includes('italic')) marks.push({ type: 'italic' });
            if (inline.marks?.includes('underline')) marks.push({ type: 'underline' });
            if (inline.marks?.includes('strikethrough')) marks.push({ type: 'strike' });

            return {
                type: 'text',
                text: inline.text || '',
                marks: marks.length > 0 ? marks : undefined,
            };
        }
        if (inline.type === 'inline_code') {
            return {
                type: 'text',
                text: inline.code || '',
                marks: [{ type: 'code' }],
            };
        }
        if (inline.type === 'link') {
            const linkText = inline.content?.[0]?.text || '';
            return {
                type: 'text',
                text: linkText,
                marks: [{ type: 'link', attrs: { href: inline.href } }],
            };
        }
        return { type: 'text', text: '' };
    });

    return {
        type: 'doc',
        content: [{
            type: 'paragraph',
            content: paragraphContent,
        }],
    };
};

// Конвертация TipTap → .doceo
const extractInlinesFromTipTap = (content: any): InlineNode[] => {
    const paragraph = content?.content?.[0];
    if (!paragraph?.content) return [{ type: 'span', text: '', marks: [] }];

    return paragraph.content.map((node: any): InlineNode => {
        if (node.type === 'text') {
            const marks = node.marks || [];
            const markTypes = marks.map((mark: any) => {
                if (mark.type === 'bold') return 'bold';
                if (mark.type === 'italic') return 'italic';
                if (mark.type === 'underline') return 'underline';
                if (mark.type === 'strike') return 'strikethrough';
                if (mark.type === 'code') return null;
                if (mark.type === 'link') return null;
                return null;
            }).filter(Boolean);

            // Проверяем, является ли это ссылкой
            const linkMark = marks.find((mark: any) => mark.type === 'link');
            if (linkMark) {
                return {
                    type: 'link',
                    href: linkMark.attrs?.href || '',
                    content: [{ type: 'span', text: node.text || '', marks: [] }],
                };
            }

            // Проверка на код
            const isCode = marks.some((mark: any) => mark.type === 'code');
            if (isCode) {
                return { type: 'inline_code', code: node.text || '' };
            }

            return {
                type: 'span',
                text: node.text || '',
                marks: markTypes as ('bold' | 'italic' | 'underline' | 'strikethrough')[],
            };
        }
        return { type: 'span', text: '', marks: [] };
    });
};

export const EditableParagraph = observer(({ block, onUpdate }: EditableParagraphProps) => {
    const handleContentChange = (content: any) => {
        const inlines = extractInlinesFromTipTap(content);
        onUpdate({
            content: {
                type: 'text',
                inlines,
            },
        });
    };

    return (
        <div className={styles.paragraph}>
            <RichTextEditor
                content={convertToTipTap(block.content)}
                onChange={handleContentChange}
                placeholder="Введите текст..."
            />
        </div>
    );
});