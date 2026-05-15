import type { HeadingBlock } from '@types/document';
import { InlineRenderer } from '@components/inline';
import styles from './Heading.module.css';

interface HeadingProps {
    block: HeadingBlock;
    onAnchorClick?: (targetId: string) => void;
}

export const Heading = ({ block, onAnchorClick }: HeadingProps) => {
    const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;

    return (
        <Tag className={styles.heading}>
            <InlineRenderer nodes={block.content.inlines} onAnchorClick={onAnchorClick} />
        </Tag>
    );
};