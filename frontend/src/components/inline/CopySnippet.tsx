import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import styles from './CopySnippet.module.css';

interface CopySnippetProps {
    text: string;
}

export const CopySnippet = ({ text }: CopySnippetProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button onClick={handleCopy} className={styles.copySnippet}>
            <code className={styles.code}>{text}</code>
            <span className={styles.icon}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </span>
        </button>
    );
};