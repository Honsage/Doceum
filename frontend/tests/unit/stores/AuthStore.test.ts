import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authStore } from '@stores/AuthStore';
import { storageService } from '@services/storage/localStorageService';
import { authApi } from '@services/api/auth';

vi.mock('@services/api/auth', () => ({
    authApi: {
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refresh: vi.fn(),
    },
}));

describe('AuthStore', () => {
    beforeEach(() => {
        localStorage.clear();
        authStore.logout();
        vi.clearAllMocks();
    });

    it('начальное состояние', () => {
        expect(authStore.user).toBeNull();
        expect(authStore.isAuthenticated).toBe(false);
        expect(authStore.isLoading).toBe(false);
        expect(authStore.error).toBeNull();
    });

    it('setUser сохраняет пользователя', () => {
        const user = {
            id: '123',
            email: 'test@example.com',
            role: 'READER' as const,
            surname: 'Test',
            name: 'User',
        };

        authStore.setUser(user);
        expect(authStore.user).toEqual(user);
        expect(storageService.getUser()).toEqual(user);
    });

    it('setUser(null) очищает пользователя', () => {
        authStore.setUser(null);
        expect(authStore.user).toBeNull();
        expect(storageService.getUser()).toBeNull();
    });

    it('isAuthor возвращает true для AUTHOR и ADMIN', () => {
        authStore.setUser({ role: 'AUTHOR' } as any);
        expect(authStore.isAuthor).toBe(true);

        authStore.setUser({ role: 'ADMIN' } as any);
        expect(authStore.isAuthor).toBe(true);

        authStore.setUser({ role: 'READER' } as any);
        expect(authStore.isAuthor).toBe(false);
    });

    it('isAdmin возвращает true только для ADMIN', () => {
        authStore.setUser({ role: 'ADMIN' } as any);
        expect(authStore.isAdmin).toBe(true);

        authStore.setUser({ role: 'AUTHOR' } as any);
        expect(authStore.isAdmin).toBe(false);

        authStore.setUser({ role: 'READER' } as any);
        expect(authStore.isAdmin).toBe(false);
    });

    it('login успешно авторизует пользователя', async () => {
        const mockResponse = {
            accessToken: 'token123',
            refreshToken: 'refresh123',
            user: {
                id: '1',
                email: 'test@example.com',
                role: 'READER',
                surname: 'Test',
                name: 'User',
            },
        };
        (authApi.login as any).mockResolvedValueOnce(mockResponse);

        const result = await authStore.login({ email: 'test@example.com', password: 'pass' });

        expect(result).toBe(true);
        expect(authStore.user).toEqual(mockResponse.user);
        expect(authStore.isAuthenticated).toBe(true);
        expect(storageService.getAccessToken()).toBe('token123');
    });

    it('login обрабатывает ошибку', async () => {
        (authApi.login as any).mockRejectedValueOnce(new Error('Invalid credentials'));

        const result = await authStore.login({ email: 'test@example.com', password: 'wrong' });

        expect(result).toBe(false);
        expect(authStore.error).toBe('Invalid credentials');
        expect(authStore.isAuthenticated).toBe(false);
    });

    it('register успешно регистрирует пользователя', async () => {
        const mockResponse = {
            accessToken: 'token123',
            refreshToken: 'refresh123',
            user: {
                id: '1',
                email: 'new@example.com',
                role: 'READER',
                surname: 'New',
                name: 'User',
            },
        };
        (authApi.register as any).mockResolvedValueOnce(mockResponse);

        const result = await authStore.register({
            email: 'new@example.com',
            password: 'pass',
            surname: 'New',
            name: 'User',
        });

        expect(result).toBe(true);
        expect(authStore.user).toEqual(mockResponse.user);
    });

    it('logout очищает все данные', async () => {
        authStore.setUser({ id: '1', email: 'test@example.com' } as any);
        storageService.setAccessToken('token');
        storageService.setRefreshToken('refresh');

        await authStore.logout();

        expect(authStore.user).toBeNull();
        expect(storageService.getAccessToken()).toBeNull();
        expect(storageService.getRefreshToken()).toBeNull();
    });

    it('refreshToken обновляет токены', async () => {
        storageService.setRefreshToken('old_refresh');
        const mockResponse = {
            accessToken: 'new_token',
            refreshToken: 'new_refresh',
            user: { id: '1', email: 'test@example.com', role: 'READER' } as any,
        };
        (authApi.refresh as any).mockResolvedValueOnce(mockResponse);

        const result = await authStore.refreshToken();

        expect(result).toBe(true);
        expect(storageService.getAccessToken()).toBe('new_token');
        expect(storageService.getRefreshToken()).toBe('new_refresh');
    });

    it('refreshToken возвращает false при отсутствии refresh токена', async () => {
        storageService.setRefreshToken(null);

        const result = await authStore.refreshToken();

        expect(result).toBe(false);
    });
});