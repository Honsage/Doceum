import { makeAutoObservable } from 'mobx';
import { storageService } from '@services/storage/localStorageService';

type Theme = 'light' | 'dark';

class UiStore {
    theme: Theme = 'light';
    isLoading = false;
    loadingCount = 0;
    notification: { message: string; type: 'info' | 'success' | 'error' | 'warning' } | null = null;

    constructor() {
        makeAutoObservable(this);
        this.initTheme();
    }

    private initTheme(): void {
        const savedTheme = storageService.getTheme();
        if (savedTheme === 'light' || savedTheme === 'dark') {
            this.theme = savedTheme;
            this.applyTheme(savedTheme);
        } else {
            const prefersDark = false;
            const defaultTheme = prefersDark ? 'dark' : 'light';
            this.theme = defaultTheme;
            this.applyTheme(defaultTheme);
        }
    }

    private applyTheme(theme: Theme): void {
        document.documentElement.setAttribute('data-theme', theme);
    }

    setTheme(theme: Theme): void {
        this.theme = theme;
        storageService.setTheme(theme);
        this.applyTheme(theme);
    }

    toggleTheme(): void {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    // Глобальный лоадер (с поддержкой вложенных вызовов)
    showLoader(): void {
        this.loadingCount++;
        this.isLoading = true;
    }

    hideLoader(): void {
        this.loadingCount--;
        if (this.loadingCount <= 0) {
            this.loadingCount = 0;
            this.isLoading = false;
        }
    }

    // Уведомления
    showNotification(message: string, type: UiStore['notification']['type'] = 'info'): void {
        this.notification = { message, type };

        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            if (this.notification?.message === message) {
                this.notification = null;
            }
        }, 5000);
    }

    clearNotification(): void {
        this.notification = null;
    }
}

export const uiStore = new UiStore();