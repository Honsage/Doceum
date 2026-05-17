import { describe, it, expect } from 'vitest';
import { fc } from '@fast-check/vitest';
import { storageService } from '@services/storage/localStorageService';

describe('Fuzz: StorageService', () => {
    it('setUser и getUser работают с любыми данными (100 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.oneof(
                    fc.constant(null),
                    fc.record({
                        id: fc.uuid(),
                        email: fc.string(),
                        role: fc.constantFrom('READER', 'AUTHOR', 'ADMIN'),
                        surname: fc.string(),
                        name: fc.string(),
                        patronymic: fc.option(fc.string()),
                        organization: fc.option(fc.string()),
                        position: fc.option(fc.string()),
                    })
                ),
                async (user) => {
                    expect(() => {
                        storageService.setUser(user);
                        const retrieved = storageService.getUser();
                        expect(retrieved).toEqual(user);
                    }).not.toThrow();
                }
            ),
            { numRuns: 100 }
        );
    });

    it('setAccessToken и getAccessToken работают с любыми строками (100 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(fc.string(), async (token) => {
                storageService.setAccessToken(token);
                const retrieved = storageService.getAccessToken();

                // Пустая строка сохраняется, но getAccessToken может вернуть null
                if (token === '') {
                    expect(retrieved === '' || retrieved === null).toBe(true);
                } else {
                    expect(retrieved).toBe(token);
                }
            }),
            { numRuns: 100 }
        );
    });
});