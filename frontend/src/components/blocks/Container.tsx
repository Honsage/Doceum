import type { BaseBlock } from '@types/document';
import { BlockRenderer } from './BlockRenderer';
import styles from './Container.module.css';

interface ContainerProps {
    block: BaseBlock & { children?: Block[] };
    getMediaUrl: (path: string) => string;
    onAnchorClick?: (targetId: string) => void;
}

export const Container = ({ block, getMediaUrl, onAnchorClick }: ContainerProps) => {
    if (!block.children || block.children.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            {block.children.map((child) => (
                <BlockRenderer
                    key={child.id}
                    block={child}
                    getMediaUrl={getMediaUrl}
                    onAnchorClick={onAnchorClick}
                />
            ))}
        </div>
    );
};