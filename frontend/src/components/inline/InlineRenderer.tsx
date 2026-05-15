import type { InlineNode } from '@types/document';
import { CopySnippet } from './CopySnippet';
import { Spoiler } from './Spoiler';
import styles from './InlineRenderer.module.css';

interface InlineRendererProps {
    nodes?: InlineNode[];  // ← делаем опциональным
    onAnchorClick?: (targetId: string) => void;
}

export const InlineRenderer = ({ nodes, onAnchorClick }: InlineRendererProps) => {
    // Защита от undefined/null
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
        return null;
    }

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

                    case 'copy_snippet':
                        return <CopySnippet key={idx} text={node.text} />;

                    case 'link':
                        return (
                            <a key={idx} href={node.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                <InlineRenderer nodes={node.content} onAnchorClick={onAnchorClick} />
                            </a>
                        );

                    case 'anchor_link':
                        return (
                            <button
                                key={idx}
                                onClick={() => onAnchorClick?.(node.targetId)}
                                className={styles.anchorLink}
                            >
                                <InlineRenderer nodes={node.content} onAnchorClick={onAnchorClick} />
                            </button>
                        );

                    case 'spoiler':
                        return (
                            <Spoiler
                                key={idx}
                                content={node.content}
                                onAnchorClick={onAnchorClick}
                            />
                        );

                    default:
                        return <span key={idx}>[{node.type}]</span>;
                }
            })}
        </>
    );
};