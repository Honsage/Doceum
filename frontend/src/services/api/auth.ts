import { request } from './client';
import type { AuthResponse, RegisterRequest, LoginRequest } from '@types/api';

export const authApi = {
    register: (data: RegisterRequest): Promise<AuthResponse> =>
        request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    login: (data: LoginRequest): Promise<AuthResponse> =>
        request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    refresh: (refreshToken: string): Promise<AuthResponse> =>
        request<AuthResponse>('/auth/refresh', {
            method: 'POST',
            headers: { 'X-Refresh-Token': refreshToken },
        }),

    logout: (refreshToken: string): Promise<void> =>
        request<void>('/auth/logout', {
            method: 'POST',
            headers: { 'X-Refresh-Token': refreshToken },
            requireAuth: true,
        }),
};