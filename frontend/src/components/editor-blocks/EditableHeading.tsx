import { observer } from 'mobx-react-lite';
import type { HeadingBlock } from '@types/document';
import styles from './EditableHeading.module.css';

interface EditableHeadingProps {
    block: HeadingBlock;
    onUpdate: (updates: Partial<HeadingBlock>) => void;
}

export const EditableHeading = observer(({ block, onUpdate }: EditableHeadingProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({
            content: {
                type: 'text',
                inlines: [{ type: 'span', text: e.target.value, marks: [] }],
            },
        });
    };

    const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;

    return (
        <Tag className={styles.heading}>
            <input
                type="text"
                value={block.content.inlines[0]?.text || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder={`Заголовок ${block.level}`}
            />
        </Tag>
    );
});