const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'user';
const THEME_KEY = 'theme';

import type { User } from '@/types/api';

export const storageService = {
    // Access token
    getAccessToken: (): string | null => localStorage.getItem(TOKEN_KEY),
    setAccessToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),

    // Refresh token
    getRefreshToken: (): string | null => localStorage.getItem(REFRESH_KEY),
    setRefreshToken: (token: string): void => localStorage.setItem(REFRESH_KEY, token),

    // User
    getUser: (): User | null => {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },
    setUser: (user: User): void => localStorage.setItem(USER_KEY, JSON.stringify(user)),
    clearUser: (): void => localStorage.removeItem(USER_KEY),

    // Tokens (both)
    clearTokens: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
    },

    // Theme
    getTheme: (): 'light' | 'dark' | null => localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null,
    setTheme: (theme: 'light' | 'dark'): void => localStorage.setItem(THEME_KEY, theme),

    // Full clear (logout)
    clearAll: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
    },
};