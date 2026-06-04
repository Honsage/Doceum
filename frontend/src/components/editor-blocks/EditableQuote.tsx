import { observer } from 'mobx-react-lite';
import { editorStore } from '@stores/EditorStore';
import { EditableParagraph } from '@components/editor-blocks/EditableParagraph';
import styles from './EditableQuote.module.css';

interface EditableQuoteProps {
    block: any;
}

export const EditableQuote = observer(({ block }: EditableQuoteProps) => {
    const renderChild = (childId: string) => {
        const child = editorStore.blocks.get(childId);
        if (!child) return null;

        switch (child.type) {
            case 'paragraph':
                return (
                    <EditableParagraph
                        key={child.id}
                        block={child}
                        onUpdate={(updates) => editorStore.updateBlock(child.id, updates)}
                    />
                );
            default:
                return (
                    <div key={child.id} className={styles.unsupportedBlock}>
                        [Неподдерживаемый тип блока: {child.type}]
                    </div>
                );
        }
    };

    const hasChildren = block.children && Array.isArray(block.children) && block.children.length > 0;

    return (
        <div className={styles.container}>
            <div className={styles.quote}>
                {hasChildren && block.children.map((childId: string) => renderChild(childId))}
                {!hasChildren && (
                    <div className={styles.emptyPlaceholder}>Цитата пуста. Нажмите + чтобы добавить содержимое</div>
                )}
            </div>
            <button
                onClick={() => editorStore.addChildBlock(block.id, 'paragraph')}
                className={styles.addButton}
                title="Добавить параграф"
            >
                +
            </button>
        </div>
    );
});