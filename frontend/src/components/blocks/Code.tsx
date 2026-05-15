import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { CodeBlock } from '@types/document';
import styles from './Code.module.css';

interface CodeProps {
    block: CodeBlock;
}

export const Code = ({ block }: CodeProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(block.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.codeBlock}>
            <div className={styles.header}>
                <span className={styles.language}>{block.language}</span>
                <button onClick={handleCopy} className={styles.copyButton}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Скопировано' : 'Копировать'}</span>
                </button>
            </div>
            <pre className={styles.pre}>
        <code className={styles.code}>{block.code}</code>
      </pre>
        </div>
    );
};