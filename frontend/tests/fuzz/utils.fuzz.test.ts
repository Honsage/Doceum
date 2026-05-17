import { describe, it, expect } from 'vitest';
import { fc } from '@fast-check/vitest';

const generateId = (): string => {
    return Math.random().toString(36).substring(2, 10);
};

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

describe('Fuzz: Utils', () => {
    it('generateId всегда возвращает строку длины 8 (100 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(fc.integer({ min: 1, max: 10000 }), async () => {
                const id = generateId();
                expect(typeof id).toBe('string');
                expect(id.length).toBe(8);
            }),
            { numRuns: 100 }
        );
    });

    it('formatDate работает с любыми валидными датами (100 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(fc.date(), async (date) => {
                const formatted = formatDate(date);
                // Год может быть отрицательным или больше 9999
                expect(formatted).toMatch(/^-?\d{1,6}-\d{2}-\d{2}$/);
            }),
            { numRuns: 100 }
        );
    });
});