import { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import type { CodeBlock } from '@types/document';
import styles from './EditableCode.module.css';

interface EditableCodeProps {
    block: CodeBlock;
    onUpdate: (updates: Partial<CodeBlock>) => void;
}

const TAB_SIZE_OPTIONS = [2, 4];

export const EditableCode = observer(({ block, onUpdate }: EditableCodeProps) => {
    const [tabSize, setTabSize] = useState(4);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const spaces = ' '.repeat(tabSize);
            const newValue = target.value.substring(0, start) + spaces + target.value.substring(end);

            onUpdate({ code: newValue });

            // Устанавливаем курсор после вставленных пробелов
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + tabSize;
                }
            }, 0);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <input
                    type="text"
                    value={block.language || ''}
                    onChange={(e) => onUpdate({ language: e.target.value })}
                    className={styles.languageInput}
                    placeholder="Язык (javascript, python, bash...)"
                />
                <div className={styles.tabSettings}>
                    <span className={styles.tabLabel}>Tab:</span>
                    {TAB_SIZE_OPTIONS.map(size => (
                        <button
                            key={size}
                            onClick={() => setTabSize(size)}
                            className={`${styles.tabButton} ${tabSize === size ? styles.active : ''}`}
                        >
                            {size} пробела
                        </button>
                    ))}
                </div>
            </div>
            <textarea
                ref={textareaRef}
                value={block.code || ''}
                onChange={(e) => onUpdate({ code: e.target.value })}
                onKeyDown={handleKeyDown}
                className={styles.codeArea}
                rows={8}
                placeholder="Введите код..."
                spellCheck={false}
            />
        </div>
    );
});