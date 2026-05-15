import { useState } from 'react';
import type { AccordionBlock } from '@types/document';
import { InlineRenderer } from '@components/inline';
import { BlockRenderer } from './BlockRenderer';
import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.css';

interface AccordionProps {
    block: AccordionBlock;
    getMediaUrl: (path: string) => string;
    onAnchorClick?: (targetId: string) => void;
}

export const Accordion = ({ block, getMediaUrl, onAnchorClick }: AccordionProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`${styles.accordion} ${isOpen ? styles.open : ''}`}>
            <button className={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles.label}>
          <InlineRenderer nodes={block.label.inlines} onAnchorClick={onAnchorClick} />
        </span>
                <ChevronDown size={16} className={styles.icon} />
            </button>
            <div className={styles.content}>
                {block.children.map((child) => (
                    <BlockRenderer
                        key={child.id}
                        block={child}
                        getMediaUrl={getMediaUrl}
                        onAnchorClick={onAnchorClick}
                    />
                ))}
            </div>
        </div>
    );
};