import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidUrl, formatDate, generateId } from '@utils/validation';

describe('Validation utils', () => {
    describe('isValidEmail', () => {
        it('возвращает true для валидных email', () => {
            expect(isValidEmail('user@example.com')).toBe(true);
            expect(isValidEmail('user.name@example.co.uk')).toBe(true);
            expect(isValidEmail('user+tag@example.com')).toBe(true);
        });

        it('возвращает false для невалидных email', () => {
            expect(isValidEmail('')).toBe(false);
            expect(isValidEmail('user@')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
            expect(isValidEmail('user@example')).toBe(false);
            expect(isValidEmail('user example@example.com')).toBe(false);
        });
    });

    describe('isValidUrl', () => {
        it('возвращает true для валидных URL', () => {
            expect(isValidUrl('https://example.com')).toBe(true);
            expect(isValidUrl('http://localhost:3000')).toBe(true);
            expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
        });

        it('возвращает false для невалидных URL', () => {
            expect(isValidUrl('')).toBe(false);
            expect(isValidUrl('not-a-url')).toBe(false);
            // ftp:// считается валидным URL конструктором, поэтому не проверяем
        });
    });

    describe('formatDate', () => {
        it('форматирует дату в YYYY-MM-DD', () => {
            const date = new Date(2024, 0, 15);
            expect(formatDate(date)).toBe('2024-01-15');
        });

        it('добавляет ведущие нули', () => {
            const date = new Date(2024, 0, 5);
            expect(formatDate(date)).toBe('2024-01-05');
        });
    });

    describe('generateId', () => {
        it('генерирует строку длины 8', () => {
            const id = generateId();
            expect(id).toHaveLength(8);
            expect(typeof id).toBe('string');
        });

        it('генерирует разные значения', () => {
            const id1 = generateId();
            const id2 = generateId();
            expect(id1).not.toBe(id2);
        });
    });
});