import { useEffect, useRef } from 'react';
import type { FormulaBlock } from '@types/document';
import styles from './Formula.module.css';

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

interface FormulaProps {
    block: FormulaBlock;
}

export const Formula = ({ block }: FormulaProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const renderFormula = async () => {
            await loadKatexAsync();
            if (containerRef.current && katex) {
                try {
                    katex.render(block.latex, containerRef.current, {
                        throwOnError: false,
                        displayMode: true,
                    });
                } catch (err) {
                    console.error('KaTeX error:', err);
                    containerRef.current.innerHTML = `<code class="${styles.error}">${block.latex}</code>`;
                }
            }
        };

        renderFormula();
    }, [block.latex]);

    return <div ref={containerRef} className={styles.formula} />;
};