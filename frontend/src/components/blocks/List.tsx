import type { ListBlock } from '@types/document';
import { InlineRenderer } from '@components/inline';
import { BlockRenderer } from './BlockRenderer';
import { Check } from 'lucide-react';
import styles from './List.module.css';

interface ListProps {
    block: ListBlock;
    getMediaUrl: (path: string) => string;
    onAnchorClick?: (targetId: string) => void;
}

export const List = ({ block, getMediaUrl, onAnchorClick }: ListProps) => {
    const ListTag = block.listType === 'ordered' ? 'ol' : 'ul';

    if (block.listType === 'checklist') {
        // Checklist — специальный рендер с чекбоксами
        return (
            <ul className={styles.checklist}>
                {block.children.map((item) => (
                    <li key={item.id} className={styles.checklistItem}>
                        <label className={styles.checklistLabel}>
                            <input type="checkbox" className={styles.checkbox} />
                            <InlineRenderer nodes={item.content.inlines} onAnchorClick={onAnchorClick} />
                        </label>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <ListTag className={styles.list}>
            {block.children.map((item) => (
                <li key={item.id} className={styles.listItem}>
                    <InlineRenderer nodes={item.content.inlines} onAnchorClick={onAnchorClick} />
                </li>
            ))}
        </ListTag>
    );
};