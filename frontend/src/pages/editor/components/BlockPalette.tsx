import { observer } from 'mobx-react-lite';
import {
    Heading1, Heading2, Heading3,
    Type, Code, Image,
    List, ListOrdered, CheckSquare,
    MessageSquare, Quote, Minus,
    LayoutGrid, Layers, ChevronRight, ChevronLeft
} from 'lucide-react';
import { editorStore } from '@stores/EditorStore';
import { v4 as uuidv4 } from 'uuid';
import styles from './BlockPalette.module.css';

interface BlockPaletteProps {
    isOpen: boolean;
    onToggle: () => void;
}

const blockTypes = [
    { id: 'heading1', type: 'heading', label: 'Заголовок 1', icon: <Heading1 size={18} />,
        create: () => ({ id: uuidv4(), type: 'heading', level: 1, content: { type: 'text', inlines: [{ type: 'span', text: 'Новый заголовок', marks: [] }] } }) },
    { id: 'heading2', type: 'heading', label: 'Заголовок 2', icon: <Heading2 size={18} />,
        create: () => ({ id: uuidv4(), type: 'heading', level: 2, content: { type: 'text', inlines: [{ type: 'span', text: 'Новый заголовок', marks: [] }] } }) },
    { id: 'heading3', type: 'heading', label: 'Заголовок 3', icon: <Heading3 size={18} />,
        create: () => ({ id: uuidv4(), type: 'heading', level: 3, content: { type: 'text', inlines: [{ type: 'span', text: 'Новый заголовок', marks: [] }] } }) },
    { id: 'paragraph', type: 'paragraph', label: 'Абзац', icon: <Type size={18} />,
        create: () => ({ id: uuidv4(), type: 'paragraph', content: { type: 'text', inlines: [{ type: 'span', text: '', marks: [] }] } }) },
    { id: 'code', type: 'code', label: 'Код', icon: <Code size={18} />,
        create: () => ({ id: uuidv4(), type: 'code', language: 'javascript', code: '// ваш код здесь' }) },
    { id: 'image', type: 'image', label: 'Изображение', icon: <Image size={18} />,
        create: () => ({ id: uuidv4(), type: 'image', src: '', alt: '' }) },
    { id: 'unordered-list', type: 'list', label: 'Маркированный список', icon: <List size={18} />,
        create: () => ({ id: uuidv4(), type: 'list', listType: 'unordered', children: [] }) },
    { id: 'ordered-list', type: 'list', label: 'Нумерованный список', icon: <ListOrdered size={18} />,
        create: () => ({ id: uuidv4(), type: 'list', listType: 'ordered', children: [] }) },
    { id: 'checklist', type: 'list', label: 'Чек-лист', icon: <CheckSquare size={18} />,
        create: () => ({ id: uuidv4(), type: 'list', listType: 'checklist', children: [] }) },
    { id: 'callout', type: 'callout', label: 'Выноска', icon: <MessageSquare size={18} />,
        create: () => ({ id: uuidv4(), type: 'callout', calloutType: 'info', children: [] }) },
    { id: 'quote', type: 'quote', label: 'Цитата', icon: <Quote size={18} />,
        create: () => ({ id: uuidv4(), type: 'quote', children: [] }) },
    { id: 'divider', type: 'divider', label: 'Разделитель', icon: <Minus size={18} />,
        create: () => ({ id: uuidv4(), type: 'divider' }) },
    { id: 'tabs', type: 'tabs', label: 'Вкладки', icon: <LayoutGrid size={18} />,
        create: () => ({ id: uuidv4(), type: 'tabs', children: [] }) },
    { id: 'stepper', type: 'stepper', label: 'Степпер', icon: <Layers size={18} />,
        create: () => ({ id: uuidv4(), type: 'stepper', children: [] }) },
    { id: 'accordion', type: 'accordion', label: 'Аккордеон', icon: <ChevronRight size={18} />,
        create: () => ({ id: uuidv4(), type: 'accordion', label: { type: 'text', inlines: [{ type: 'span', text: 'Название', marks: [] }] }, children: [] }) },
];

export const BlockPalette = observer(({ isOpen, onToggle }: BlockPaletteProps) => {
    const addBlock = (blockType: typeof blockTypes[0]) => {
        const newBlock = blockType.create();
        editorStore.addBlock(null, newBlock);
    };

    return (
        <div className={`${styles.palette} ${isOpen ? styles.open : styles.closed}`}>
            <div className={styles.header}>
                <button className={styles.toggleButton} onClick={onToggle}>
                    {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
                {isOpen && <span className={styles.title}>Блоки</span>}
            </div>

            {isOpen && (
                <div className={styles.list}>
                    {blockTypes.map((block) => (
                        <button
                            key={block.id}
                            className={styles.blockItem}
                            onClick={() => addBlock(block)}
                        >
                            <span className={styles.icon}>{block.icon}</span>
                            <span className={styles.label}>{block.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});