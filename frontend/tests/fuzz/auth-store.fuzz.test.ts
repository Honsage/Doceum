import { describe, it, expect, beforeEach } from 'vitest';
import { fc } from '@fast-check/vitest';
import { authStore } from '@stores/AuthStore';

describe('Fuzz: AuthStore', () => {
    beforeEach(() => {
        authStore.logout();
    });

    it('setUser не падает при любых данных (100 итераций)', async () => {
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
                        authStore.setUser(user);
                    }).not.toThrow();
                }
            ),
            { numRuns: 100 }
        );
    });

    it('логин не падает при любых credentials (50 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 0, maxLength: 100 }),
                fc.string({ minLength: 0, maxLength: 100 }),
                async (email, password) => {
                    try {
                        await authStore.login({ email, password });
                    } catch {
                        // Ожидаемо — тестовый аккаунт может не существовать
                    }
                    expect(authStore.isLoading).toBe(false);
                }
            ),
            { numRuns: 50, timeout: 60000 }
        );
    });
});