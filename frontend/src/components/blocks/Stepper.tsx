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
    const progress = (activeIndex + 1) / totalSteps;

    const goNext = () => {
        if (activeIndex < totalSteps - 1) setActiveIndex(activeIndex + 1);
    };

    const goPrev = () => {
        if (activeIndex > 0) setActiveIndex(activeIndex - 1);
    };

    const currentStep = block.children[activeIndex] as StepItemBlock;

    return (
        <div className={styles.stepper}>
            {/* Прогресс-бар */}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${progress * 100}%` }}
                />
            </div>

            {/* Шапка: номер + название + кнопки */}
            <div className={styles.header}>
                <div className={styles.stepInfo}>
                    <span className={styles.stepNumber}>{activeIndex + 1}</span>
                    <span className={styles.stepLabel}>
            {currentStep.label && (
                <InlineRenderer nodes={currentStep.label.inlines} onAnchorClick={onAnchorClick} />
            )}
          </span>
                </div>

                <div className={styles.navButtons}>
                    <button
                        onClick={goPrev}
                        disabled={activeIndex === 0}
                        className={styles.navButton}
                        aria-label="Предыдущий шаг"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={goNext}
                        disabled={activeIndex === totalSteps - 1}
                        className={styles.navButton}
                        aria-label="Следующий шаг"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Контент шага */}
            <div className={styles.content}>
                {currentStep.children.map((child) => (
                    <BlockRenderer
                        key={child.id}
                        block={child}
                        getMediaUrl={getMediaUrl}
                        onAnchorClick={onAnchorClick}
                    />
                ))}
            </div>

            {/* Футер: счётчик шагов */}
            <div className={styles.footer}>
        <span className={styles.stepCounter}>
          Шаг {activeIndex + 1} из {totalSteps}
        </span>
            </div>
        </div>
    );
};