import { useEffect, useRef } from 'react';
import styles from './InlineFormula.module.css';

// Динамический импорт KaTeX (чтобы не грузился, если нет формул)
let katex: any;
let loadKatex: Promise<void> | null = null;

const loadKatexAsync = async () => {
    if (!loadKatex) {
        loadKatex = import('katex').then(module => {
            katex = module.default;
        });
    }
    return loadKatex;
};

interface InlineFormulaProps {
    latex: string;
}

export const InlineFormula = ({ latex }: InlineFormulaProps) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const renderFormula = async () => {
            await loadKatexAsync();
            if (containerRef.current && katex) {
                try {
                    katex.render(latex, containerRef.current, {
                        throwOnError: false,
                        displayMode: false, // inline режим
                    });
                } catch (err) {
                    console.error('KaTeX error:', err);
                    containerRef.current.innerHTML = `<code class="${styles.error}">${latex}</code>`;
                }
            }
        };

        renderFormula();
    }, [latex]);

    return <span ref={containerRef} className={styles.inlineFormula} />;
};