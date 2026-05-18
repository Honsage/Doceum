import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { GripVertical, Copy, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { editorStore } from '@stores/EditorStore';
import styles from './EditableBlock.module.css';

interface EditableBlockProps {
    block: any;
    children: React.ReactNode;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
}

export const EditableBlock = observer(({
                                           block,
                                           children,
                                           onMoveUp,
                                           onMoveDown,
                                           onDuplicate,
                                           onDelete,
                                       }: EditableBlockProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const isSelected = editorStore.selectedBlockId === block.id;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        editorStore.setSelectedBlockId(block.id);
    };

    return (
        <div
            className={`${styles.editableBlock} ${isSelected ? styles.selected : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <div className={styles.toolbar}>
                <div className={styles.dragHandle}>
                    <GripVertical size={16} />
                </div>
                <div className={styles.blockType}>{block.type}</div>
                <div className={styles.actions}>
                    {onMoveUp && (
                        <button onClick={onMoveUp} className={styles.actionButton} title="Переместить вверх">
                            <ArrowUp size={14} />
                        </button>
                    )}
                    {onMoveDown && (
                        <button onClick={onMoveDown} className={styles.actionButton} title="Переместить вниз">
                            <ArrowDown size={14} />
                        </button>
                    )}
                    {onDuplicate && (
                        <button onClick={onDuplicate} className={styles.actionButton} title="Дублировать">
                            <Copy size={14} />
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={onDelete} className={`${styles.actionButton} ${styles.danger}`} title="Удалить">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>
            {isHovered && <div className={styles.dropIndicator} />}
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
});