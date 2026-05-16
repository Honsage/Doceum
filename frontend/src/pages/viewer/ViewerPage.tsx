import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Star } from 'lucide-react';
import { documentsApi } from '@services/api/documents';
import { profileApi } from '@services/api/profile';
import { doceumParser } from '@services/parser';
import { BlockRenderer } from '@components/blocks';
import { authStore } from '@stores/AuthStore';
import { uiStore } from '@stores/UiStore';
import styles from './ViewerPage.module.css';

export const ViewerPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [doc, setDoc] = useState<{
        manifest: {
            id: string;
            title: string;
            authorId: string;
            createdAt: string;
            updatedAt: string;
            contentSha256: string;
            hasSignature: boolean;
        };
        content: { root: any[] };
    } | null>(null);
    const [mediaUrls, setMediaUrls] = useState<Map<string, string>>(new Map());
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [documentBytes, setDocumentBytes] = useState<Uint8Array | null>(null);

    const { isAuthenticated } = authStore;

    useEffect(() => {
        if (!id) {
            setError('ID документа не указан');
            setLoading(false);
            return;
        }

        loadDocument();
        checkIsFavorite();
    }, [id]);

    const loadDocument = async () => {
        setLoading(true);
        setError(null);
        uiStore.showLoader();

        try {
            const blob = await documentsApi.view(id);
            const bytes = new Uint8Array(await blob.arrayBuffer());
            setDocumentBytes(bytes);

            const result = await doceumParser.parse(bytes);

            if (!result.ok) {
                setError(result.errors?.join(', ') || 'Ошибка парсинга документа');
                setLoading(false);
                uiStore.hideLoader();
                return;
            }

            if (!result.manifest || !result.content) {
                setError('Невалидный документ');
                setLoading(false);
                uiStore.hideLoader();
                return;
            }

            setDoc({
                manifest: result.manifest,
                content: result.content,
            });

        } catch (err) {
            console.error('Failed to load document:', err);
            setError('Не удалось загрузить документ. Возможно, он не опубликован или удалён.');
        } finally {
            setLoading(false);
            uiStore.hideLoader();
        }
    };

    const checkIsFavorite = async () => {
        if (!isAuthenticated || !id) return;

        try {
            const response = await profileApi.getFavorites(100, 0);
            const isFav = response.items.some(item => item.documentId === id);
            setIsFavorite(isFav);
        } catch (err) {
            console.error('Failed to check favorite:', err);
        }
    };

    const handleDownload = async () => {
        if (!id) return;

        uiStore.showLoader();

        try {
            const blob = await documentsApi.view(id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${doc?.manifest.title || 'document'}.doceo`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            uiStore.showNotification('Документ скачан', 'success');
        } catch (err) {
            console.error('Download error:', err);
            uiStore.showNotification('Ошибка при скачивании', 'error');
        } finally {
            uiStore.hideLoader();
        }
    };

    const handleFavoriteToggle = async () => {
        if (!isAuthenticated) {
            uiStore.showNotification('Войдите, чтобы добавить в избранное', 'warning');
            navigate('/login');
            return;
        }

        if (!id) return;

        setFavoriteLoading(true);

        // Оптимистичное обновление: меняем UI сразу
        const wasFavorite = isFavorite;
        setIsFavorite(!wasFavorite);

        try {
            if (wasFavorite) {
                await profileApi.removeFromFavorites(id);
                uiStore.showNotification('Удалено из избранного', 'info');
            } else {
                await profileApi.addToFavorites(id);
                uiStore.showNotification('Добавлено в избранное', 'success');
            }
        } catch (err) {
            // Если ошибка — откатываем обратно
            setIsFavorite(wasFavorite);
            uiStore.showNotification('Ошибка', 'error');
        } finally {
            setFavoriteLoading(false);
        }
    };

    const getMediaUrl = (path: string): string => {
        if (!documentBytes) return '';

        if (mediaUrls.has(path)) {
            return mediaUrls.get(path)!;
        }

        doceumParser.extractMedia(documentBytes, path).then(bytes => {
            if (bytes) {
                const blob = new Blob([bytes]);
                const url = URL.createObjectURL(blob);
                setMediaUrls(prev => new Map(prev).set(path, url));
            }
        });

        return '';
    };

    const handleAnchorClick = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
        return () => {
            mediaUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [mediaUrls]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Загрузка документа...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>Ошибка</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/library')} className={styles.button}>
                        Вернуться в библиотеку
                    </button>
                </div>
            </div>
        );
    }

    if (!doc) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>{doc.manifest.title}</h1>
                    <div className={styles.meta}>
                        <span>ID: {doc.manifest.id}</span>
                        <span>Обновлён: {new Date(doc.manifest.updatedAt).toLocaleDateString()}</span>
                        {doc.manifest.hasSignature && (
                            <span className={styles.signed}>Подписан</span>
                        )}
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <button
                        onClick={handleDownload}
                        className={styles.actionButton}
                        title="Скачать документ"
                    >
                        <Download size={18} />
                        <span>Скачать</span>
                    </button>

                    <button
                        onClick={handleFavoriteToggle}
                        disabled={favoriteLoading}
                        className={`${styles.actionButton} ${isFavorite ? styles.favoriteActive : ''}`}
                        title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                    >
                        <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                        <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                {doc.content.root.map((block) => (
                    <BlockRenderer
                        key={block.id}
                        block={block}
                        getMediaUrl={getMediaUrl}
                        onAnchorClick={handleAnchorClick}
                    />
                ))}
            </div>
        </div>
    );
};