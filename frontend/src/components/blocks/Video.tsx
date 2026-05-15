import type { VideoBlock } from '@types/document';
import styles from './Video.module.css';

interface VideoProps {
    block: VideoBlock;
    getMediaUrl: (path: string) => string;
}

export const Video = ({ block, getMediaUrl }: VideoProps) => {
    // YouTube URL парсинг
    const getYouTubeEmbedUrl = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
            /youtube\.com\/embed\/([\w-]+)/,
            /youtube\.com\/v\/([\w-]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return `https://www.youtube.com/embed/${match[1]}`;
            }
        }
        return null;
    };

    // Vimeo URL парсинг
    const getVimeoEmbedUrl = (url: string): string | null => {
        const match = url.match(/(?:vimeo\.com\/)(\d+)/);
        if (match && match[1]) {
            return `https://player.vimeo.com/video/${match[1]}`;
        }
        return null;
    };

    let embedUrl: string | null = null;
    let isEmbed = false;

    if (block.srcType === 'url') {
        embedUrl = getYouTubeEmbedUrl(block.src) || getVimeoEmbedUrl(block.src);
        isEmbed = !!embedUrl;
    }

    const src = block.srcType === 'file' ? getMediaUrl(block.src) : block.src;

    return (
        <div className={styles.videoWrapper}>
            {isEmbed ? (
                <iframe
                    className={styles.video}
                    src={embedUrl!}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ aspectRatio: block.aspectRatio || '16/9' }}
                />
            ) : (
                <video
                    className={styles.video}
                    src={src}
                    controls
                    playsInline
                    style={{ aspectRatio: block.aspectRatio || '16/9' }}
                />
            )}
        </div>
    );
};