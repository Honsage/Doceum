import { useState } from 'react';
import type { QuizBlock } from '@types/document';
import { InlineRenderer } from '@components/inline';
import { BlockRenderer } from './BlockRenderer';
import { Check, X, RotateCcw } from 'lucide-react';
import styles from './Quiz.module.css';

interface QuizProps {
    block: QuizBlock;
    getMediaUrl: (path: string) => string;
    onAnchorClick?: (targetId: string) => void;
}

export const Quiz = ({ block, getMediaUrl, onAnchorClick }: QuizProps) => {
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);

    const handleAnswerChange = (optionId: string, isCheckbox: boolean) => {
        if (submitted) return;

        if (isCheckbox) {
            setSelectedAnswers(prev =>
                prev.includes(optionId)
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            );
        } else {
            setSelectedAnswers([optionId]);
        }
    };

    const handleSubmit = () => {
        if (selectedAnswers.length === 0) return;
        setSubmitted(true);
    };

    const handleReset = () => {
        setSelectedAnswers([]);
        setSubmitted(false);
    };

    const isCorrect = () => {
        if (block.inputType === 'text') return false;
        if (!block.correct) return false;

        const sortedSelected = [...selectedAnswers].sort();
        const sortedCorrect = [...block.correct].sort();
        return JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
    };

    const correct = isCorrect();

    return (
        <div className={styles.quiz}>
            <div className={styles.question}>
                <InlineRenderer nodes={block.question.inlines} onAnchorClick={onAnchorClick} />
            </div>

            <div className={styles.options}>
                {block.inputType === 'radio' && block.options?.map(option => (
                    <label key={option.id} className={styles.option}>
                        <input
                            type="radio"
                            name="quiz"
                            value={option.id}
                            checked={selectedAnswers.includes(option.id)}
                            onChange={() => handleAnswerChange(option.id, false)}
                            disabled={submitted}
                        />
                        <span className={styles.optionContent}>
              {option.content.map((item, idx) => {
                  if (item.type === 'text') {
                      return <InlineRenderer key={idx} nodes={item.inlines} />;
                  }
                  if (item.type === 'image') {
                      return <BlockRenderer key={idx} block={item} getMediaUrl={getMediaUrl} />;
                  }
                  return null;
              })}
            </span>
                    </label>
                ))}

                {block.inputType === 'checkbox' && block.options?.map(option => (
                    <label key={option.id} className={styles.option}>
                        <input
                            type="checkbox"
                            value={option.id}
                            checked={selectedAnswers.includes(option.id)}
                            onChange={() => handleAnswerChange(option.id, true)}
                            disabled={submitted}
                        />
                        <span className={styles.optionContent}>
              {option.content.map((item, idx) => {
                  if (item.type === 'text') {
                      return <InlineRenderer key={idx} nodes={item.inlines} />;
                  }
                  if (item.type === 'image') {
                      return <BlockRenderer key={idx} block={item} getMediaUrl={getMediaUrl} />;
                  }
                  return null;
              })}
            </span>
                    </label>
                ))}

                {block.inputType === 'text' && (
                    <input
                        type="text"
                        className={styles.textInput}
                        placeholder="Введите ответ..."
                        value={selectedAnswers[0] || ''}
                        onChange={(e) => setSelectedAnswers([e.target.value])}
                        disabled={submitted}
                    />
                )}
            </div>

            <div className={styles.actions}>
                {!submitted ? (
                    <button onClick={handleSubmit} className={styles.submitButton}>
                        Проверить ответ
                    </button>
                ) : (
                    <div className={`${styles.result} ${correct ? styles.correct : styles.incorrect}`}>
                        {correct ? (
                            <>
                                <Check size={18} />
                                <span>Верно!</span>
                            </>
                        ) : (
                            <>
                                <X size={18} />
                                <span>Неверный ответ</span>
                            </>
                        )}
                    </div>
                )}

                {submitted && (
                    <button onClick={handleReset} className={styles.resetButton}>
                        <RotateCcw size={14} />
                        <span>Пройти заново</span>
                    </button>
                )}
            </div>
        </div>
    );
};