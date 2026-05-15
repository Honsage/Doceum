import type { InlineNode} from '@types/document';
import styles from './InlineRenderer.module.css';

interface InlineRendererProps {
    nodes: InlineNode[];
    onAnchorClick?: (targetId: string) => void;
}

export const InlineRenderer = ({ nodes, onAnchorClick }: InlineRendererProps) => {
    return (
        <>
            {nodes.map((node, idx) => {
                switch (node.type) {
                    case 'span':
                        let text = <>{node.text}</>;
                        if (node.marks) {
                            if (node.marks.includes('bold')) text = <strong>{text}</strong>;
                            if (node.marks.includes('italic')) text = <em>{text}</em>;
                            if (node.marks.includes('underline')) text = <u>{text}</u>;
                            if (node.marks.includes('strikethrough')) text = <s>{text}</s>;
                        }
                        return <span key={idx}>{text}</span>;

                    case 'inline_code':
                        return <code key={idx} className={styles.inlineCode}>{node.code}</code>;

                    case 'link':
                        return (
                            <a key={idx} href={node.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                <InlineRenderer nodes={node.content || []} onAnchorClick={onAnchorClick} />
                            </a>
                        );

                    case 'anchor_link':
                        return (
                            <button
                                key={idx}
                                onClick={() => onAnchorClick?.(node.targetId || '')}
                                className={styles.anchorLink}
                            >
                                <InlineRenderer nodes={node.content || []} onAnchorClick={onAnchorClick} />
                            </button>
                        );

                    default:
                        return <span key={idx}>[{node.type}]</span>;
                }
            })}
        </>
    );
};