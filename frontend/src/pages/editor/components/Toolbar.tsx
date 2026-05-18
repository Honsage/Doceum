import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Save, Eye, ArrowLeft, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { editorStore } from '@stores/EditorStore';
import { uiStore } from '@stores/UiStore';
import styles from './Toolbar.module.css';

interface ToolbarProps {
    onSave: () => Promise<void>;
    onPreview: () => Promise<void>;
    onPublish?: () => Promise<void>;
    isSaving?: boolean;
}

export const Toolbar = observer(({ onSave, onPreview, onPublish, isSaving }: ToolbarProps) => {
    const navigate = useNavigate();
    const [saveFeedback, setSaveFeedback] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [publishFeedback, setPublishFeedback] = useState<'idle' | 'publishing' | 'published'>('idle');

    // Сброс обратной связи через 2 секунды
    useEffect(() => {
        if (saveFeedback === 'saved') {
            const timer = setTimeout(() => setSaveFeedback('idle'), 2000);
            return () => clearTimeout(timer);
        }
    }, [saveFeedback]);

    useEffect(() => {
        if (publishFeedback === 'published') {
            const timer = setTimeout(() => setPublishFeedback('idle'), 2000);
            return () => clearTimeout(timer);
        }
    }, [publishFeedback]);

    const handleSave = async () => {
        if (saveFeedback !== 'idle') return;

        setSaveFeedback('saving');
        await onSave();
        setSaveFeedback('saved');
    };

    const handlePreview = async () => {
        if (saveFeedback === 'saving') {
            uiStore.showNotification('Подождите, сохранение...', 'info');
            return;
        }
        await onPreview();
    };

    const handlePublish = async () => {
        if (publishFeedback !== 'idle') return;

        setPublishFeedback('publishing');
        await onPublish?.();
        setPublishFeedback('published');
    };

    const handleBack = () => {
        navigate(-1);
    };

    const getSaveIcon = () => {
        if (saveFeedback === 'saving') return <Loader2 size={18} className={styles.spinning} />;
        if (saveFeedback === 'saved') return <CheckCircle size={18} />;
        return <Save size={18} />;
    };

    const getPublishIcon = () => {
        if (publishFeedback === 'publishing') return <Loader2 size={18} className={styles.spinning} />;
        if (publishFeedback === 'published') return <CheckCircle size={18} />;
        return <Sparkles size={18} />;
    };

    return (
        <div className={styles.toolbar}>
            <div className={styles.left}>
                <button onClick={handleBack} className={styles.button}>
                    <ArrowLeft size={18} />
                    <span>Назад</span>
                </button>
                <div className={styles.separator} />
                <div className={styles.title}>
                    <input
                        type="text"
                        value={editorStore.title}
                        onChange={(e) => editorStore.title = e.target.value}
                        placeholder="Название документа"
                        className={styles.titleInput}
                    />
                </div>
            </div>

            <div className={styles.right}>
                <button onClick={handlePreview} className={styles.button}>
                    <Eye size={18} />
                    <span>Предпросмотр</span>
                </button>

                <button
                    onClick={handleSave}
                    disabled={saveFeedback !== 'idle'}
                    className={`${styles.button} ${styles.primary} ${saveFeedback === 'saved' ? styles.success : ''}`}
                >
                    {getSaveIcon()}
                    <span>
                        {saveFeedback === 'saving' && 'Сохранение...'}
                        {saveFeedback === 'saved' && 'Сохранено!'}
                        {saveFeedback === 'idle' && 'Сохранить'}
                    </span>
                </button>

                {onPublish && (
                    <button
                        onClick={handlePublish}
                        disabled={publishFeedback !== 'idle'}
                        className={`${styles.button} ${styles.primary} ${publishFeedback === 'published' ? styles.success : ''}`}
                    >
                        {getPublishIcon()}
                        <span>
                            {publishFeedback === 'publishing' && 'Публикация...'}
                            {publishFeedback === 'published' && 'Опубликовано!'}
                            {publishFeedback === 'idle' && 'Опубликовать'}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
});