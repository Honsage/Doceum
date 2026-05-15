import { useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';
import type { InlineNode } from '@types/document';
import { InlineRenderer } from './InlineRenderer';
import styles from './Spoiler.module.css';

interface SpoilerProps {
    content: InlineNode[];
    onAnchorClick?: (targetId: string) => void;
}

export const Spoiler = ({ content, onAnchorClick }: SpoilerProps) => {
    const [isRevealed, setIsRevealed] = useState(false);

    if (isRevealed) {
        return (
            <span className={styles.revealed}>
        <InlineRenderer nodes={content} onAnchorClick={onAnchorClick} />
      </span>
        );
    }

    return (
        <button
            onClick={() => setIsRevealed(true)}
            className={styles.spoilerButton}
        >
            <EyeOff size={14} />
            <span>Спойлер</span>
        </button>
    );
};