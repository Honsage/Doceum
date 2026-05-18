import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Eye, EyeOff, Trash2, Plus } from 'lucide-react';
import { profileApi } from '@services/api/profile';
import { documentsApi } from '@services/api/documents';
import { authStore } from '@stores/AuthStore';
import { uiStore } from '@stores/UiStore';
import type { DraftItem, PublishedItem } from '@types/api';
import styles from './MyDocumentsTab.module.css';

type TabType = 'drafts' | 'published';

export const MyDocumentsTab = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState<TabType>('drafts');
    const [drafts, setDrafts] = useState<DraftItem[]>([]);
    const [published, setPublished] = useState<PublishedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Загружаем оба списка при монтировании
    useEffect(() => {
        loadBothLists();
    }, []);

    const loadBothLists = async () => {
        setLoading(true);
        try {
            const [draftsResponse, publishedResponse] = await Promise.all([
                profileApi.getDrafts(50, 0),
                profileApi.getPublished(50, 0)
            ]);
            setDrafts(draftsResponse.items);
            setPublished(publishedResponse.items);
        } catch (err) {
            uiStore.showNotification('Ошибка загрузки документов', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        // Обновляем только текущую вкладку (для обновления после удаления/снятия)
        try {
            if (tab === 'drafts') {
                const response = await profileApi.getDrafts(50, 0);
                setDrafts(response.items);
            } else {
                const response = await profileApi.getPublished(50, 0);
                setPublished(response.items);
            }
        } catch (err) {
            uiStore.showNotification('Ошибка загрузки документов', 'error');
        }
    };

    const createNewDocument = async () => {
        setIsCreating(true);
        uiStore.showLoader();

        try {
            const response = await documentsApi.create({
                title: 'Новый документ',
                description: '',
            });

            navigate(`/editor/${response.id}`);
        } catch (err) {
            console.error('Create error:', err);
            uiStore.showNotification('Ошибка создания документа', 'error');
        } finally {
            setIsCreating(false);
            uiStore.hideLoader();
        }
    };

    const handleDelete = async (documentId: string) => {
        if (!confirm('Удалить документ? Это действие нельзя отменить.')) return;

        try {
            await documentsApi.delete(documentId);
            await loadData();
            uiStore.showNotification('Документ удалён', 'info');
        } catch (err) {
            uiStore.showNotification('Ошибка при удалении', 'error');
        }
    };

    const handleUnpublish = async (documentId: string) => {
        try {
            await documentsApi.unpublish(documentId);
            await loadData();
            uiStore.showNotification('Документ снят с публикации', 'info');
        } catch (err) {
            uiStore.showNotification('Ошибка при снятии с публикации', 'error');
        }
    };

    const items = tab === 'drafts' ? drafts : published;
    const isEmpty = items.length === 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tabButton} ${tab === 'drafts' ? styles.active : ''}`}
                        onClick={() => setTab('drafts')}
                    >
                        Черновики ({drafts.length})
                    </button>
                    <button
                        className={`${styles.tabButton} ${tab === 'published' ? styles.active : ''}`}
                        onClick={() => setTab('published')}
                    >
                        Опубликованные ({published.length})
                    </button>
                </div>
                <button
                    onClick={createNewDocument}
                    disabled={isCreating}
                    className={styles.createButton}
                >
                    <Plus size={16} />
                    {isCreating ? 'Создание...' : 'Создать'}
                </button>
            </div>

            {loading && <div className={styles.loading}>Загрузка...</div>}

            {!loading && isEmpty && (
                <div className={styles.empty}>
                    <FileText size={48} />
                    <p>Нет {tab === 'drafts' ? 'черновиков' : 'опубликованных документов'}</p>
                    {tab === 'drafts' && (
                        <button onClick={createNewDocument} className={styles.linkButton}>
                            Создать первый документ
                        </button>
                    )}
                </div>
            )}

            {!loading && !isEmpty && (
                <div className={styles.list}>
                    {items.map((item) => (
                        <div key={item.documentId} className={styles.card}>
                            <Link
                                to={tab === 'drafts' ? `/editor/${item.documentId}` : `/viewer/${item.documentId}`}
                                className={styles.cardContent}
                            >
                                <h3 className={styles.cardTitle}>{item.title}</h3>
                                <p className={styles.cardDescription}>{item.description}</p>
                                <div className={styles.cardMeta}>
                                    {tab === 'drafts' ? (
                                        <span>Обновлён: {new Date(item.updatedAt).toLocaleDateString()}</span>
                                    ) : (
                                        <span>Опубликован: {new Date(item.publishedAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </Link>
                            <div className={styles.cardActions}>
                                {tab === 'published' && (
                                    <button
                                        onClick={() => handleUnpublish(item.documentId)}
                                        className={styles.actionButton}
                                        title="Снять с публикации"
                                    >
                                        <EyeOff size={16} />
                                    </button>
                                )}
                                <Link
                                    to={`/editor/${item.documentId}`}
                                    className={styles.actionButton}
                                    title="Редактировать"
                                >
                                    <Eye size={16} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(item.documentId)}
                                    className={`${styles.actionButton} ${styles.danger}`}
                                    title="Удалить"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};