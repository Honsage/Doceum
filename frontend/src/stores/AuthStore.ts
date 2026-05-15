import { makeAutoObservable, runInAction } from 'mobx';
import { authApi } from '@/services/api/auth';
import { storageService } from '@/services/storage/localStorageService';
import type { User, LoginRequest, RegisterRequest } from '@/types/api';

class AuthStore {
    user: User | null = null;
    isLoading = false;
    error: string | null = null;
    isInitialized = false;

    constructor() {
        makeAutoObservable(this);
        this.init();
    }

    private init(): void {
        const user = storageService.getUser();
        const token = storageService.getAccessToken();

        if (user && token) {
            this.user = user;
        }

        this.isInitialized = true;
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
                this.user = response.user;
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
        return this.user?.role === 'AUTHOR' || this.user?.role === 'ADMIN';
    }

    get isAdmin(): boolean {
        return this.user?.role === 'ADMIN';
    }
}

export const authStore = new AuthStore();