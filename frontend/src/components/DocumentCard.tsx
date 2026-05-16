import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { profileApi } from '@services/api/profile';
import { authStore } from '@stores/AuthStore';
import { uiStore } from '@stores/UiStore';
import type { DocumentMetadata } from '@types/api';
import styles from './DocumentCard.module.css';

interface DocumentCardProps {
    document: DocumentMetadata;
    onFavoriteToggle?: () => void;
}

export const DocumentCard = ({ document, onFavoriteToggle }: DocumentCardProps) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = authStore;

    useEffect(() => {
        // Проверка, в избранном ли документ (требуется эндпоинт)
        setIsFavorite(false);
    }, [document.id]);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            uiStore.showNotification('Войдите, чтобы добавить в избранное', 'warning');
            return;
        }

        setLoading(true);

        try {
            if (isFavorite) {
                // await profileApi.removeFromFavorites(document.publicationId);
                uiStore.showNotification('Удалено из избранного', 'info');
                setIsFavorite(false);
            } else {
                // await profileApi.addToFavorites(document.publicationId);
                uiStore.showNotification('Добавлено в избранное', 'success');
                setIsFavorite(true);
            }
            onFavoriteToggle?.();
        } catch (err) {
            uiStore.showNotification('Ошибка', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.card}>
            <Link to={`/viewer/${document.id}`} className={styles.cardLink}>
                <div className={styles.cardContent}>
                    <h3 className={styles.title}>{document.title}</h3>
                    <div className={styles.meta}>
                        <span className={styles.author}>{document.author.fullName}</span>
                        <span className={styles.date}>
              {document.publishedAt && new Date(document.publishedAt).toLocaleDateString()}
            </span>
                    </div>
                    <p className={styles.description}>{document.description}</p>
                </div>
            </Link>
            <button
                onClick={handleFavoriteClick}
                disabled={loading}
                className={`${styles.favoriteButton} ${isFavorite ? styles.isFavorite : ''}`}
                aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
                <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
        </div>
    );
};