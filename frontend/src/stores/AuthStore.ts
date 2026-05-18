import { makeAutoObservable, runInAction } from 'mobx';
import { authApi } from '@services/api/auth';
import { storageService } from '@services/storage/localStorageService';
import type { User, LoginRequest, RegisterRequest } from '@types/api';

class AuthStore {
    user: User | null = null;
    isLoading = false;
    error: string | null = null;
    isInitialized = false;

    constructor() {
        makeAutoObservable(this);
        this.init();
    }

    private async init(): Promise<void> {
        const user = storageService.getUser();
        const token = storageService.getAccessToken();
        const refreshToken = storageService.getRefreshToken();

        if (user && token && refreshToken) {
            // Проверяем, не истёк ли токен (простая проверка на клиенте)
            const isTokenValid = this.isTokenValid(token);

            if (isTokenValid) {
                this.user = user;
            } else {
                // Токен истёк — пробуем обновить
                const refreshed = await this.refreshToken();
                if (!refreshed) {
                    storageService.clearAll();
                }
            }
        }

        this.isInitialized = true;
    }

    private isTokenValid(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000; // в миллисекундах
            return exp > Date.now();
        } catch {
            return false;
        }
    }

    setUser(user: User | null): void {
        this.user = user;
        if (user) {
            storageService.setUser(user);
        } else {
            storageService.clearUser();
        }
    }

    setError(error: string | null): void {
        this.error = error;
    }

    setLoading(loading: boolean): void {
        this.isLoading = loading;
    }

    async login(credentials: LoginRequest): Promise<boolean> {
        this.setLoading(true);
        this.setError(null);

        try {
            const response = await authApi.login(credentials);

            runInAction(() => {
                storageService.setAccessToken(response.accessToken);
                storageService.setRefreshToken(response.refreshToken);
                this.setUser(response.user);
                this.isLoading = false;
            });

            return true;
        } catch (err) {
            runInAction(() => {
                this.error = err instanceof Error ? err.message : 'Login failed';
                this.isLoading = false;
            });
            return false;
        }
    }

    async register(data: RegisterRequest): Promise<boolean> {
        this.setLoading(true);
        this.setError(null);

        try {
            const response = await authApi.register(data);

            runInAction(() => {
                storageService.setAccessToken(response.accessToken);
                storageService.setRefreshToken(response.refreshToken);
                this.user = response.user;
                this.isLoading = false;
            });

            return true;
        } catch (err) {
            runInAction(() => {
                this.error = err instanceof Error ? err.message : 'Registration failed';
                this.isLoading = false;
            });
            return false;
        }
    }

    async logout(): Promise<void> {
        const refreshToken = storageService.getRefreshToken();

        if (refreshToken) {
            try {
                await authApi.logout(refreshToken);
            } catch (err) {
                console.warn('Logout API error:', err);
            }
        }

        storageService.clearAll();
        this.user = null;
        this.error = null;
    }

    async refreshToken(): Promise<boolean> {
        const refreshToken = storageService.getRefreshToken();

        if (!refreshToken) {
            return false;
        }

        try {
            const response = await authApi.refresh(refreshToken);

            runInAction(() => {
                storageService.setAccessToken(response.accessToken);
                storageService.setRefreshToken(response.refreshToken);
                this.user = response.user;
            });

            return true;
        } catch (err) {
            console.error('Token refresh failed:', err);
            await this.logout();
            return false;
        }
    }

    get isAuthenticated(): boolean {
        return this.user !== null && storageService.getAccessToken() !== null;
    }

    get isAuthor(): boolean {
        const result = this.user?.role === 'AUTHOR' || this.user?.role === 'ADMIN';
        console.log('🔐 isAuthor check:', this.user?.role, '→', result);
        return this.user?.role === 'AUTHOR' || this.user?.role === 'ADMIN';
    }

    get isAdmin(): boolean {
        return this.user?.role === 'ADMIN';
    }
}

export const authStore = new AuthStore();