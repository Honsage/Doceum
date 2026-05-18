import { observer } from 'mobx-react-lite';
import { editorStore } from '@stores/EditorStore';
import styles from './PropertiesPanel.module.css';

export const PropertiesPanel = observer(() => {
    const selectedBlock = editorStore.selectedBlock;

    if (!selectedBlock) {
        return (
            <div className={styles.panel}>
                <div className={styles.empty}>
                    <p>Выберите блок для редактирования</p>
                </div>
            </div>
        );
    }

    const renderProperties = () => {
        switch (selectedBlock.type) {
            case 'heading':
                return (
                    <>
                        <div className={styles.field}>
                            <label className={styles.label}>Уровень заголовка</label>
                            <select
                                value={selectedBlock.level}
                                onChange={(e) => editorStore.updateBlock(selectedBlock.id, { level: parseInt(e.target.value) })}
                                className={styles.select}
                            >
                                <option value={1}>Заголовок 1</option>
                                <option value={2}>Заголовок 2</option>
                                <option value={3}>Заголовок 3</option>
                                <option value={4}>Заголовок 4</option>
                                <option value={5}>Заголовок 5</option>
                                <option value={6}>Заголовок 6</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Текст заголовка</label>
                            <input
                                type="text"
                                value={selectedBlock.content?.inlines?.[0]?.text || ''}
                                onChange={(e) => editorStore.updateBlock(selectedBlock.id, {
                                    content: {
                                        type: 'text',
                                        inlines: [{ type: 'span', text: e.target.value, marks: [] }],
                                    },
                                })}
                                className={styles.input}
                                placeholder="Текст заголовка"
                            />
                        </div>
                    </>
                );

            case 'code':
                return (
                    <>
                        <div className={styles.field}>
                            <label className={styles.label}>Язык</label>
                            <input
                                type="text"
                                value={selectedBlock.language || ''}
                                onChange={(e) => editorStore.updateBlock(selectedBlock.id, { language: e.target.value })}
                                className={styles.input}
                                placeholder="javascript, python, bash..."
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Код</label>
                            <textarea
                                value={selectedBlock.code || ''}
                                onChange={(e) => editorStore.updateBlock(selectedBlock.id, { code: e.target.value })}
                                className={styles.textarea}
                                rows={10}
                                placeholder="Введите код..."
                            />
                        </div>
                    </>
                );

            case 'image':
                return (
                    <>
                        <div className={styles.field}>
                            <label className={styles.label}>Alt текст (для доступности)</label>
                            <input
                                type="text"
                                value={selectedBlock.alt || ''}
                                onChange={(e) => editorStore.updateBlock(selectedBlock.id, { alt: e.target.value })}
                                className={styles.input}
                                placeholder="Описание изображения"
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Подпись (caption)</label>
                            <input
                                type="text"
                                value={selectedBlock.caption || ''}
                                onChange={(e) => editorStore.updateBlock(selectedBlock.id, { caption: e.target.value })}
                                className={styles.input}
                                placeholder="Подпись к изображению"
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>URL изображения</label>
                            <input
                                type="text"
                                value={selectedBlock.src || ''}
                                onChange={(e) => editorStore.updateBlock(selectedBlock.id, { src: e.target.value })}
                                className={styles.input}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </>
                );

            case 'callout':
                return (
                    <div className={styles.field}>
                        <label className={styles.label}>Тип</label>
                        <select
                            value={selectedBlock.calloutType || 'info'}
                            onChange={(e) => editorStore.updateBlock(selectedBlock.id, { calloutType: e.target.value })}
                            className={styles.select}
                        >
                            <option value="info">Информация</option>
                            <option value="tip">Совет</option>
                            <option value="warning">Предупреждение</option>
                            <option value="danger">Опасность</option>
                        </select>
                    </div>
                );

            case 'list':
                return (
                    <div className={styles.field}>
                        <label className={styles.label}>Тип списка</label>
                        <select
                            value={selectedBlock.listType || 'unordered'}
                            onChange={(e) => editorStore.updateBlock(selectedBlock.id, { listType: e.target.value })}
                            className={styles.select}
                        >
                            <option value="unordered">Маркированный</option>
                            <option value="ordered">Нумерованный</option>
                            <option value="checklist">Чек-лист</option>
                        </select>
                    </div>
                );

            default:
                return (
                    <div className={styles.empty}>
                        <p>Нет доступных свойств для этого типа блока</p>
                    </div>
                );
        }
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h3 className={styles.title}>Свойства блока</h3>
                <span className={styles.blockType}>{selectedBlock.type}</span>
            </div>
            <div className={styles.content}>
                {renderProperties()}
            </div>
        </div>
    );
});