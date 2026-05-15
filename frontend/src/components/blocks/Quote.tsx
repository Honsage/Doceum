import type { QuoteBlock } from '@types/document';
import { BlockRenderer } from './BlockRenderer';
import styles from './Quote.module.css';

interface QuoteProps {
    block: QuoteBlock;
    getMediaUrl: (path: string) => string;
    onAnchorClick?: (targetId: string) => void;
}

export const Quote = ({ block, getMediaUrl, onAnchorClick }: QuoteProps) => {
    return (
        <blockquote className={styles.quote}>
            {block.children.map((child) => (
                <BlockRenderer
                    key={child.id}
                    block={child}
                    getMediaUrl={getMediaUrl}
                    onAnchorClick={onAnchorClick}
                />
            ))}
        </blockquote>
    );
};