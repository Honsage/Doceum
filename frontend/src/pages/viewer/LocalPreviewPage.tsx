import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { documentStore } from '@stores/DocumentStore';
import { BlockRenderer } from '@components/blocks';
import { doceumParser } from '@services/parser';
import styles from './LocalPreviewPage.module.css';

export const LocalPreviewPage = observer(() => {
    const navigate = useNavigate();
    const [mediaUrls, setMediaUrls] = useState<Map<string, string>>(new Map());

    const { localDocument, localDocumentBytes } = documentStore;

    useEffect(() => {
        // Если нет документа — возвращаем на страницу загрузки
        if (!localDocument || !localDocumentBytes) {
            navigate('/viewer/local');
        }

        // Очищаем Blob URL при размонтировании
        return () => {
            mediaUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [localDocument, localDocumentBytes, navigate]);

    if (!localDocument || !localDocumentBytes) {
        return null;
    }

    const getMediaUrl = (path: string): string => {
        if (mediaUrls.has(path)) {
            return mediaUrls.get(path)!;
        }

        // Извлекаем медиа из ZIP (асинхронно)
        doceumParser.extractMedia(localDocumentBytes, path).then(bytes => {
            if (bytes) {
                const blob = new Blob([bytes]);
                const url = URL.createObjectURL(blob);
                setMediaUrls(prev => new Map(prev).set(path, url));
            }
        });

        return ''; // временно пусто, пока загружается
    };

    const handleAnchorClick = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Хедер документа */}
                <div className={styles.header}>
                    <h1 className={styles.title}>{localDocument.manifest.title}</h1>
                    <div className={styles.meta}>
                        <span>Автор: {localDocument.manifest.authorId}</span>
                        <span>Создан: {new Date(localDocument.manifest.createdAt).toLocaleDateString()}</span>
                        {localDocument.manifest.hasSignature && (
                            <span className={styles.signed}>Подписан</span>
                        )}
                    </div>
                </div>

                {/* Содержимое */}
                <div className={styles.content}>
                    {localDocument.content.root.map((block) => (
                        <BlockRenderer
                            key={block.id}
                            block={block}
                            getMediaUrl={getMediaUrl}
                            onAnchorClick={handleAnchorClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});