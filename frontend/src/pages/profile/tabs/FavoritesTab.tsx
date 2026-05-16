import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { profileApi } from '@services/api/profile';
import { uiStore } from '@stores/UiStore';
import type { FavoriteItem } from '@types/api';
import styles from './FavoritesTab.module.css';

export const FavoritesTab = () => {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await profileApi.getFavorites(50, 0);
            setFavorites(response.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (publicationId: string) => {
        try {
            await profileApi.removeFromFavorites(publicationId);
            setFavorites(prev => prev.filter(f => f.publicationId !== publicationId));
            uiStore.showNotification('Удалено из избранного', 'info');
        } catch (err) {
            uiStore.showNotification('Ошибка при удалении', 'error');
        }
    };

    if (loading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (favorites.length === 0) {
        return (
            <div className={styles.empty}>
                <Star size={48} />
                <p>У вас пока нет избранных документов</p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {favorites.map((item) => (
                <div key={item.publicationId} className={styles.card}>
                    <Link to={`/viewer/${item.documentId}`} className={styles.cardContent}>
                        <h3 className={styles.cardTitle}>{item.title}</h3>
                        <p className={styles.cardDescription}>{item.description}</p>
                        <div className={styles.cardMeta}>
                            <span>{item.author.fullName}</span>
                            <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => handleRemove(item.publicationId)}
                        className={styles.removeButton}
                        aria-label="Удалить из избранного"
                    >
                        <Star size={16} fill="currentColor" />
                    </button>
                </div>
            ))}
        </div>
    );
};