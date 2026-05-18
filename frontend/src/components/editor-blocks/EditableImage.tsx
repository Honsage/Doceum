import { useState, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Upload, X } from 'lucide-react';
import type { ImageBlock } from '@types/document';
import { editorStore } from '@stores/EditorStore';
import styles from './EditableImage.module.css';

interface EditableImageProps {
    block: ImageBlock;
    onUpdate: (updates: Partial<ImageBlock>) => void;
}

export const EditableImage = observer(({ block, onUpdate }: EditableImageProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение');
            return;
        }

        setIsUploading(true);

        const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
        const mediaPath = `media/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const bytes = new Uint8Array(await file.arrayBuffer());

        editorStore.addMediaFile(mediaPath, bytes);

        // alt = описание изображения (пока имя файла, пользователь потом изменит в свойствах)
        // caption = подпись под изображением (пустая, пользователь заполнит)
        onUpdate({
            src: mediaPath,
            alt: file.name,      // временно имя файла, можно изменить в свойствах
            caption: ''          // подпись пустая, пользователь заполнит отдельно
        });

        setIsUploading(false);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files[0]) handleFile(files[0]);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    };

    const handleClear = () => {
        if (block.src && block.src.startsWith('media/')) {
            editorStore.removeMediaFile(block.src);
        }
        onUpdate({ src: '', alt: '', caption: '' });
    };

    // Получаем blob URL для отображения
    const getImageUrl = () => {
        if (!block.src) return '';
        const mediaData = editorStore.getMediaFile(block.src);
        if (mediaData) {
            return URL.createObjectURL(new Blob([mediaData]));
        }
        return block.src;
    };

    if (block.src) {
        const imageUrl = getImageUrl();

        return (
            <div className={styles.container}>
                <div className={styles.preview}>
                    {imageUrl && <img src={imageUrl} alt={block.alt} className={styles.image} />}
                    <button onClick={handleClear} className={styles.removeButton}>
                        <X size={16} />
                    </button>
                </div>
                <div className={styles.captionWrapper}>
                    <input
                        type="text"
                        value={block.caption || ''}
                        onChange={(e) => onUpdate({ caption: e.target.value })}
                        className={styles.captionInput}
                        placeholder="Подпись к изображению"
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
        >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className={styles.fileInput} />
            {isUploading ? (
                <div className={styles.uploadingContent}>
                    <div className={styles.spinner} />
                    <span>Загрузка...</span>
                </div>
            ) : (
                <div className={styles.content}>
                    <Upload size={32} />
                    <p>Перетащите изображение сюда или кликните для выбора</p>
                    <span className={styles.hint}>Поддерживаются PNG, JPG, WebP, GIF, SVG</span>
                </div>
            )}
        </div>
    );
});