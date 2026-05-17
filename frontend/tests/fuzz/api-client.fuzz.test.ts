import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fc } from '@fast-check/vitest';
import { request, ApiError } from '@services/api/client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Fuzz: API Client', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('request не падает при любых endpoint (50 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(fc.string({ minLength: 0, maxLength: 100 }), async (endpoint) => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({}),
                });

                try {
                    await request(endpoint, { requireAuth: false });
                    expect(true).toBe(true);
                } catch (err) {
                    // Разрешаем ошибки только если endpoint пустой
                    if (endpoint === '' || endpoint.trim() === '') {
                        expect(err).toBeInstanceOf(ApiError);
                        expect(err.status).toBe(400);
                    } else {
                        throw err;
                    }
                }
            }),
            { numRuns: 50 }
        );
    });

    it('request обрабатывает любые HTTP статусы (50 итераций)', async () => {
        await fc.assert(
            fc.asyncProperty(fc.integer({ min: 100, max: 599 }), async (status) => {
                const isOk = status >= 200 && status < 300;

                mockFetch.mockResolvedValueOnce({
                    ok: isOk,
                    status,
                    statusText: `Status ${status}`,
                    json: async () => ({ message: `Error ${status}` }),
                    text: async () => `Error ${status}`,
                });

                try {
                    const result = await request('/test', { requireAuth: false });
                    // Если запрос успешен, проверяем что статус действительно ok
                    expect(isOk).toBe(true);
                    expect(result).toBeDefined();
                } catch (err) {
                    // Если ошибка, проверяем что статус не ok
                    expect(isOk).toBe(false);
                    expect(err).toBeInstanceOf(ApiError);
                }
            }),
            { numRuns: 50 }
        );
    });
});