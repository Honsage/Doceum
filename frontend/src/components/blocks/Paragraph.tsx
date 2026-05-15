import type { ParagraphBlock } from '@types/document';
import { InlineRenderer } from '@components/inline';
import styles from './Paragraph.module.css';

interface ParagraphProps {
    block: ParagraphBlock;
    onAnchorClick?: (targetId: string) => void;
}

export const Paragraph = ({ block, onAnchorClick }: ParagraphProps) => {
    return (
        <p className={styles.paragraph}>
            <InlineRenderer nodes={block.content.inlines} onAnchorClick={onAnchorClick} />
        </p>
    );
};