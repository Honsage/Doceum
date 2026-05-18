import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Toolbar } from './components/Toolbar';
import { BlockPalette } from './components/BlockPalette';
import { PropertiesPanel } from './components/PropertiesPanel';
import { EditableBlock } from './components/EditableBlock';
import { EditableParagraph } from '@components/editor-blocks/EditableParagraph';
import { EditableHeading } from '@components/editor-blocks/EditableHeading';
import { EditableCode } from '@components/editor-blocks/EditableCode';
import { EditableImage } from '@components/editor-blocks/EditableImage';
import { editorStore } from '@stores/EditorStore';
import { uiStore } from '@stores/UiStore';
import { documentsApi } from '@services/api/documents';
import { doceumParser } from '@services/parser';
import styles from './EditorPage.module.css';

export const EditorPage = observer(() => {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [isPaletteOpen, setIsPaletteOpen] = useState(true);

    useEffect(() => {
        if (documentId) {
            loadDocument(documentId);
        } else {
            navigate('/profile');
        }
    }, [documentId]);

    const loadDocument = async (id: string) => {
        editorStore.setLoading(true);
        uiStore.showLoader();

        try {
            const metadata = await documentsApi.getMetadataWithAuth(id);
            editorStore.title = metadata.title;
            editorStore.description = metadata.description;
            editorStore.documentId = id;

            // getDraft возвращает Uint8Array, не нужно вызывать .arrayBuffer()
            const bytes = await documentsApi.getDraft(id);

            const parseResult = await doceumParser.parse(bytes);

            if (parseResult.ok && parseResult.content) {
                const blocks: any[] = [];
                const rootIds: string[] = [];

                const flattenBlocks = (blockList: any[]): string[] => {
                    const ids: string[] = [];
                    for (const block of blockList) {
                        blocks.push(block);
                        ids.push(block.id);
                        if (block.children && block.children.length > 0) {
                            const childIds = flattenBlocks(block.children);
                            block.children = childIds;
                        }
                    }
                    return ids;
                };

                const rootIdsResult = flattenBlocks(parseResult.content.root);
                editorStore.setDocument(id, metadata.title, metadata.description, blocks, rootIdsResult);
            } else {
                editorStore.setDocument(id, metadata.title, metadata.description, [], []);
            }

        } catch (err) {
            console.error('Load error:', err);
            uiStore.showNotification('Ошибка загрузки документа', 'error');
            navigate('/profile');
        } finally {
            editorStore.setLoading(false);
            uiStore.hideLoader();
        }
    };

    const handleSave = async () => {
        const docId = editorStore.documentId;

        if (!docId) {
            uiStore.showNotification('ID документа не найден', 'error');
            return;
        }

        setIsSaving(true);
        uiStore.showLoader();

        try {
            // 1. Обновляем метаданные
            const metadataSuccess = await documentsApi.updateMetadata(docId, editorStore.title, editorStore.description);
            if (!metadataSuccess) {
                throw new Error('Ошибка обновления метаданных');
            }

            // 2. Сохраняем черновик
            const doceoBytes = await editorStore.serializeToDoceo();
            const blob = new Blob([doceoBytes], { type: 'application/octet-stream' });
            const file = new File([blob], `${docId}.doceo`, { type: 'application/octet-stream' });

            const success = await documentsApi.saveDraft(docId, file);

            if (success) {
                uiStore.showNotification('Документ сохранён', 'success');
            } else {
                throw new Error('Ошибка сохранения контента');
            }
        } catch (err) {
            console.error('Save error:', err);
            uiStore.showNotification('Ошибка сохранения документа', 'error');
        } finally {
            setIsSaving(false);
            uiStore.hideLoader();
        }
    };

    const handlePreview = () => {
        const docId = editorStore.documentId;
        if (!docId) {
            uiStore.showNotification('Сначала сохраните документ', 'warning');
            return;
        }
        window.open(`/viewer/${docId}?preview=true`, '_blank');
    };

    const handlePublish = async () => {
        const docId = editorStore.documentId;
        if (!docId) return;

        uiStore.showLoader();

        try {
            await documentsApi.publish(docId);
            uiStore.showNotification('Документ опубликован', 'success');
        } catch (err) {
            uiStore.showNotification('Ошибка публикации', 'error');
        } finally {
            uiStore.hideLoader();
        }
    };

    const renderBlock = (block: any, index: number) => {
        const blockProps = {
            block,
            onUpdate: (updates: any) => editorStore.updateBlock(block.id, updates),
        };

        switch (block.type) {
            case 'heading':
                return <EditableHeading {...blockProps} />;
            case 'paragraph':
                return <EditableParagraph {...blockProps} />;
            case 'code':
                return <EditableCode {...blockProps} />;
            case 'image':
                return <EditableImage {...blockProps} />;
            default:
                return <div className={styles.blockPreview}>[{block.type}] Редактирование в разработке</div>;
        }
    };

    if (editorStore.isLoading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>Загрузка...</span>
            </div>
        );
    }

    return (
        <div className={styles.editor}>
            <div className={styles.toolbar}>
                <Toolbar
                    onSave={handleSave}
                    onPreview={handlePreview}
                    onPublish={handlePublish}
                    isSaving={isSaving}
                />
            </div>

            <div className={styles.workspace}>
                <div className={styles.palette}>
                    <BlockPalette isOpen={isPaletteOpen} onToggle={() => setIsPaletteOpen(!isPaletteOpen)} />
                </div>

                <div className={styles.canvas}>
                    <div className={styles.document}>
                        {editorStore.rootBlockIds.map((blockId, index) => {
                            const block = editorStore.blocks.get(blockId);
                            if (!block) return null;

                            return (
                                <EditableBlock
                                    key={block.id}
                                    block={block}
                                    onMoveUp={() => editorStore.moveBlock(block.id, index - 1)}
                                    onMoveDown={() => editorStore.moveBlock(block.id, index + 1)}
                                    onDuplicate={() => editorStore.duplicateBlock(block.id)}
                                    onDelete={() => editorStore.deleteBlock(block.id)}
                                >
                                    {renderBlock(block, index)}
                                </EditableBlock>
                            );
                        })}

                        {editorStore.rootBlockIds.length === 0 && (
                            <div className={styles.empty}>
                                <p>Нажмите на кнопку "Блоки" слева, чтобы добавить первый блок</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.propertiesPanel}>
                    <PropertiesPanel />
                </div>
            </div>
        </div>
    );
});