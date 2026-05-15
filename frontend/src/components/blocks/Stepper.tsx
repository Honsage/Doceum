import { useState } from 'react';
import type { StepperBlock, StepItemBlock } from '@types/document';
import { InlineRenderer } from '@components/inline';
import { BlockRenderer } from './BlockRenderer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Stepper.module.css';

interface StepperProps {
    block: StepperBlock;
    getMediaUrl: (path: string) => string;
    onAnchorClick?: (targetId: string) => void;
}

export const Stepper = ({ block, getMediaUrl, onAnchorClick }: StepperProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const totalSteps = block.children.length;

    const goNext = () => {
        if (activeIndex < totalSteps - 1) setActiveIndex(activeIndex + 1);
    };

    const goPrev = () => {
        if (activeIndex > 0) setActiveIndex(activeIndex - 1);
    };

    return (
        <div className={styles.stepper}>
            <div className={styles.steps}>
                {block.children.map((step: StepItemBlock, idx: number) => (
                    <div
                        key={step.id}
                        className={`${styles.step} ${idx === activeIndex ? styles.active : ''} ${
                            idx < activeIndex ? styles.completed : ''
                        }`}
                        onClick={() => setActiveIndex(idx)}
                    >
                        <span className={styles.stepNumber}>{idx + 1}</span>
                        <span className={styles.stepLabel}>
              <InlineRenderer nodes={step.label.inlines} onAnchorClick={onAnchorClick} />
            </span>
                    </div>
                ))}
            </div>

            <div className={styles.content}>
                {block.children[activeIndex]?.children.map((child) => (
                    <BlockRenderer
                        key={child.id}
                        block={child}
                        getMediaUrl={getMediaUrl}
                        onAnchorClick={onAnchorClick}
                    />
                ))}
            </div>

            <div className={styles.navigation}>
                <button onClick={goPrev} disabled={activeIndex === 0} className={styles.navButton}>
                    <ChevronLeft size={16} />
                    Назад
                </button>
                <button onClick={goNext} disabled={activeIndex === totalSteps - 1} className={styles.navButton}>
                    Вперёд
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};