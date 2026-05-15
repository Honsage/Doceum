import type { ImageBlock } from '@types/document';
import styles from './Image.module.css';

interface ImageProps {
    block: ImageBlock;
    getMediaUrl: (path: string) => string;
}

export const Image = ({ block, getMediaUrl }: ImageProps) => {
    const src = getMediaUrl(block.src);

    return (
        <figure className={styles.figure}>
            <img src={src} alt={block.alt} className={styles.image} />
            {block.alt && <figcaption className={styles.caption}>{block.alt}</figcaption>}
        </figure>
    );
};