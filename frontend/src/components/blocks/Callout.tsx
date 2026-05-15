import type { CalloutBlock } from '@types/document';
import { BlockRenderer } from './BlockRenderer';
import { Info, Lightbulb, AlertTriangle, AlertOctagon } from 'lucide-react';
import styles from './Callout.module.css';

interface CalloutProps {
    block: CalloutBlock;
    getMediaUrl: (path: string) => string;
    onAnchorClick?: (targetId: string) => void;
}

const icons = {
    info: Info,
    tip: Lightbulb,
    warning: AlertTriangle,
    danger: AlertOctagon,
};

export const Callout = ({ block, getMediaUrl, onAnchorClick }: CalloutProps) => {
    const Icon = icons[block.calloutType] || Info;

    return (
        <div className={`${styles.callout} ${styles[block.calloutType]}`}>
            <div className={styles.icon}>
                <Icon size={18} />
            </div>
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