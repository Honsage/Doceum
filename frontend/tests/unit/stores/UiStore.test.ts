import { describe, it, expect, beforeEach } from 'vitest';
import { uiStore } from '@stores/UiStore';

describe('UiStore', () => {
    beforeEach(() => {
        // Сброс состояния
        uiStore.clearNotification();
        // Сбрасываем счётчик загрузки
        while (uiStore.isLoading) {
            uiStore.hideLoader();
        }
    });

    it('начальное состояние', () => {
        expect(uiStore.theme).toBeDefined();
        expect(uiStore.isLoading).toBe(false);
        expect(uiStore.notification).toBeNull();
    });

    it('showLoader увеличивает счетчик', () => {
        expect(uiStore.isLoading).toBe(false);
        uiStore.showLoader();
        expect(uiStore.isLoading).toBe(true);
        uiStore.showLoader();
        expect(uiStore.isLoading).toBe(true);
    });

    it('hideLoader уменьшает счетчик', () => {
        uiStore.showLoader();
        uiStore.showLoader();
        expect(uiStore.isLoading).toBe(true);
        uiStore.hideLoader();
        expect(uiStore.isLoading).toBe(true);
        uiStore.hideLoader();
        expect(uiStore.isLoading).toBe(false);
    });

    it('showNotification сохраняет уведомление', () => {
        uiStore.showNotification('Test message', 'success');
        expect(uiStore.notification).toEqual({
            message: 'Test message',
            type: 'success',
        });
    });

    it('clearNotification очищает уведомление', () => {
        uiStore.showNotification('Test', 'info');
        uiStore.clearNotification();
        expect(uiStore.notification).toBeNull();
    });

    it('toggleTheme переключает тему', () => {
        const initialTheme = uiStore.theme;
        uiStore.toggleTheme();
        expect(uiStore.theme).not.toBe(initialTheme);
    });

    it('setTheme устанавливает тему', () => {
        uiStore.setTheme('dark');
        expect(uiStore.theme).toBe('dark');
        uiStore.setTheme('light');
        expect(uiStore.theme).toBe('light');
    });
});