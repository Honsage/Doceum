import type { Block } from '@types/document';
import { Heading } from './Heading';
import { Paragraph } from './Paragraph';
import { Code } from './Code';
import { Image } from './Image';
import { Video } from './Video';
import { Tabs } from './Tabs';
import { Stepper } from './Stepper';
import { Accordion } from './Accordion';
import { List } from './List';
import { Callout } from './Callout';
import { Quote } from './Quote';
import { Divider } from './Divider';
import { Quiz } from './Quiz';
import { Table } from './Table';
import { Formula } from './Formula';
import { Container } from './Container';
import styles from './BlockRenderer.module.css';

interface BlockRendererProps {
    block: Block;
    getMediaUrl: (path: string) => string;
    onAnchorClick?: (targetId: string) => void;
}

export const BlockRenderer = ({ block, getMediaUrl, onAnchorClick }: BlockRendererProps) => {
    switch (block.type) {
        case 'heading':
            return <Heading block={block} onAnchorClick={onAnchorClick} />;

        case 'paragraph':
            return <Paragraph block={block} onAnchorClick={onAnchorClick} />;

        case 'code':
            return <Code block={block} />;

        case 'image':
            return <Image block={block} getMediaUrl={getMediaUrl} />;

        case 'video':
            return <Video block={block} getMediaUrl={getMediaUrl} />;

        case 'tabs':
            return <Tabs block={block} getMediaUrl={getMediaUrl} onAnchorClick={onAnchorClick} />;

        case 'stepper':
            return <Stepper block={block} getMediaUrl={getMediaUrl} onAnchorClick={onAnchorClick} />;

        case 'accordion':
            return <Accordion block={block} getMediaUrl={getMediaUrl} onAnchorClick={onAnchorClick} />;

        case 'list':
            return <List block={block} getMediaUrl={getMediaUrl} onAnchorClick={onAnchorClick} />;

        case 'callout':
            return <Callout block={block} getMediaUrl={getMediaUrl} onAnchorClick={onAnchorClick} />;

        case 'quote':
            return <Quote block={block} getMediaUrl={getMediaUrl} onAnchorClick={onAnchorClick} />;

        case 'divider':
            return <Divider />;

        case 'quiz':
            return <Quiz block={block} getMediaUrl={getMediaUrl} onAnchorClick={onAnchorClick} />;

        case 'table':
            return <Table block={block} onAnchorClick={onAnchorClick} />;

        case 'formula':
            return <Formula block={block} />;

        case 'container':
            return <Container block={block} getMediaUrl={getMediaUrl} onAnchorClick={onAnchorClick} />;

        default:
            console.warn(`Unknown block type: ${block.type}`);
            return <div className={styles.unknown}>[Неизвестный блок: {block.type}]</div>;
    }
};