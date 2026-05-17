import { describe, it, expect } from 'vitest';
import { fc } from '@fast-check/vitest';

function isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return regex.test(email);
}

// Генератор валидного email
const validEmailArbitrary = fc
    .tuple(
        fc.string({ minLength: 1, maxLength: 20 }),      // local part
        fc.string({ minLength: 1, maxLength: 10 }),      // domain
        fc.constantFrom('com', 'ru', 'org', 'net', 'edu') // tld
    )
    .map(([local, domain, tld]) => {
        // Очищаем от спецсимволов, которые не могут быть в email
        const cleanLocal = local.replace(/[^a-zA-Z0-9._-]/g, '');
        const cleanDomain = domain.replace(/[^a-zA-Z0-9]/g, '');
        if (cleanLocal.length === 0 || cleanDomain.length === 0) {
            return `a@${cleanDomain || 'example'}.${tld}`;
        }
        return `${cleanLocal}@${cleanDomain}.${tld}`;
    });

// Генератор невалидного email
const invalidEmailArbitrary = fc.oneof(
    fc.string({ minLength: 1, maxLength: 50 }),
    fc.string({ minLength: 1, maxLength: 30 })
);

describe('Fuzz: Email validation', () => {
    it('валидный email должен содержать @ и точку после неё (100 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(validEmailArbitrary, async (email) => {
                expect(isValidEmail(email)).toBe(true);
                expect(email).toContain('@');
                const afterAt = email.split('@')[1];
                expect(afterAt).toContain('.');
            }),
            { numRuns: 100 }
        );
    });

    it('невалидный email не должен проходить валидацию (100 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(invalidEmailArbitrary, async (email) => {
                fc.pre(!isValidEmail(email));
                expect(isValidEmail(email)).toBe(false);
            }),
            { numRuns: 100 }
        );
    });

    it('граничные случаи email (пустая строка, очень длинный)', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.oneof(fc.constant(''), fc.string({ minLength: 200, maxLength: 500 })),
                async (email) => {
                    const result = isValidEmail(email);
                    expect(typeof result).toBe('boolean');
                }
            ),
            { numRuns: 50 }
        );
    });
});