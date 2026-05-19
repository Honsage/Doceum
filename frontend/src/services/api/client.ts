import { authStore } from '@stores/AuthStore';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions extends RequestInit {
    requireAuth?: boolean;
}

class ApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    if (!endpoint || endpoint.trim() === '') {
        throw new ApiError(400, 'Invalid endpoint');
    }

    const { requireAuth = false, ...fetchOptions } = options;


    const getHeaders = (token?: string): HeadersInit => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (fetchOptions.headers) {
            Object.assign(headers, fetchOptions.headers);
        }

        if (requireAuth && token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    };

    const makeRequest = async (token?: string): Promise<Response> => {
        return fetch(`${API_BASE}${endpoint}`, {
            ...fetchOptions,
            headers: getHeaders(token),
        });
    };

    // Первый запрос
    let token = requireAuth ? localStorage.getItem('accessToken') : undefined;

    if (requireAuth && !token) {
        throw new ApiError(401, 'No access token');
    }

    if (requireAuth) {
        const token = localStorage.getItem('accessToken');
        console.log('🔐 Token for request:', token ? `${token.substring(0, 30)}...` : '❌ NO TOKEN');
        if (!token) {
            throw new ApiError(401, 'No access token');
        }
        getHeaders(token);
    }

    let response = await makeRequest(token);

    // Если 401 и есть refresh токен — пробуем обновить
    if (response.status === 401 && requireAuth) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
            const refreshed = await authStore.refreshToken();

            if (refreshed) {
                // Получаем новый токен
                const newToken = localStorage.getItem('accessToken');
                response = await makeRequest(newToken || undefined);
            }
        }

        // Если refresh не удался или нет refresh токена
        if (response.status === 401) {
            await authStore.logout();
            throw new ApiError(401, 'Session expired. Please login again.');
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, errorText || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

export { request, ApiError, API_BASE };