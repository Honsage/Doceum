import { useState } from 'react';
import type { TabsBlock, TabItemBlock } from '@types/document';
import { InlineRenderer } from '@components/inline';
import { BlockRenderer } from './BlockRenderer';
import styles from './Tabs.module.css';

interface TabsProps {
    block: TabsBlock;
    getMediaUrl: (path: string) => string;
    onAnchorClick?: (targetId: string) => void;
}

export const Tabs = ({ block, getMediaUrl, onAnchorClick }: TabsProps) => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className={styles.tabs}>
            <div className={styles.headers}>
                {block.children.map((tab: TabItemBlock, idx: number) => (
                    <button
                        key={tab.id}
                        className={`${styles.tabButton} ${idx === activeIndex ? styles.active : ''}`}
                        onClick={() => setActiveIndex(idx)}
                    >
                        <InlineRenderer nodes={tab.label.inlines} onAnchorClick={onAnchorClick} />
                    </button>
                ))}
            </div>
            <div className={styles.content}>
                {block.children[activeIndex]?.children.map((child) => (
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