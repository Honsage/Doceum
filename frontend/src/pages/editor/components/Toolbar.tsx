import { observer } from 'mobx-react-lite';
import { Save, Eye, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { editorStore } from '@stores/EditorStore';
import { uiStore } from '@stores/UiStore';
import styles from './Toolbar.module.css';

interface ToolbarProps {
    onSave: () => Promise<void>;
    onPreview: () => void;
    onPublish?: () => Promise<void>;
    isSaving?: boolean;
}

export const Toolbar = observer(({ onSave, onPreview, onPublish, isSaving }: ToolbarProps) => {
    const navigate = useNavigate();

    const handleSave = async () => {
        await onSave();
    };

    const handlePreview = () => {
        onPreview();
    };

    const handleBack = () => {
        navigate(-1);
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
                <button onClick={handleSave} disabled={isSaving} className={`${styles.button} ${styles.primary}`}>
                    <Save size={18} />
                    <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
                </button>
                {onPublish && (
                    <button onClick={onPublish} className={`${styles.button} ${styles.success}`}>
                        <Sparkles size={18} />
                        <span>Опубликовать</span>
                    </button>
                )}
            </div>
        </div>
    );
});