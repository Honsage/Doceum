import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X } from 'lucide-react';
import { doceumParser } from '@services/parser';
import { documentStore } from '@stores/DocumentStore';
import { uiStore } from '@stores/UiStore';
import styles from './LocalViewerPage.module.css';

export const LocalViewerPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback(async (file: File) => {
        // Проверка расширения
        if (!file.name.endsWith('.doceo')) {
            setError('Пожалуйста, выберите файл с расширением .doceo');
            return;
        }

        setSelectedFile(file);
        setError(null);
        setParsing(true);
        uiStore.showLoader();

        try {
            const bytes = new Uint8Array(await file.arrayBuffer());
            const result = await doceumParser.parse(bytes);

            if (!result.ok) {
                setError(result.errors?.join(', ') || 'Ошибка парсинга документа');
                setSelectedFile(null);
                setParsing(false);
                uiStore.hideLoader();
                return;
            }

            // Сохраняем в store
            documentStore.setLocalDocument(result, bytes);

            // Переходим на страницу просмотра
            navigate('/viewer/local/preview');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
            setSelectedFile(null);
        } finally {
            setParsing(false);
            uiStore.hideLoader();
        }
    }, [navigate]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title}>Просмотр документа</h1>
                <p className={styles.subtitle}>
                    Загрузите файл в формате <code>.doceo</code>
                </p>

                <div
                    className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''} ${selectedFile ? styles.hasFile : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".doceo"
                        onChange={handleFileSelect}
                        className={styles.fileInput}
                    />

                    {!selectedFile ? (
                        <div className={styles.dropzoneContent}>
                            <Upload size={48} className={styles.uploadIcon} />
                            <p>Перетащите файл сюда или кликните для выбора</p>
                            <span className={styles.hint}>Поддерживаются файлы .doceo</span>
                        </div>
                    ) : (
                        <div className={styles.fileInfo}>
                            <FileText size={24} />
                            <div className={styles.fileDetails}>
                                <span className={styles.fileName}>{selectedFile.name}</span>
                                <span className={styles.fileSize}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
                            </div>
                            {!parsing && (
                                <button onClick={handleClear} className={styles.clearButton}>
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {parsing && (
                    <div className={styles.parsing}>
                        <div className={styles.spinner} />
                        <span>Разбор документа...</span>
                    </div>
                )}

                {error && (
                    <div className={styles.error}>
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};