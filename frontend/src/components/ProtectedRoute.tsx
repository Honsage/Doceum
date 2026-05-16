import { Navigate, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { authStore } from '@stores/AuthStore';
import { uiStore } from '@stores/UiStore';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    allowedRoles?: ('READER' | 'AUTHOR' | 'ADMIN')[];
    redirectTo?: string;
}

export const ProtectedRoute = observer(({
                                            allowedRoles,
                                            redirectTo = '/login'
                                        }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isLoading, isInitialized } = authStore;

    // Пока проверяем инициализацию — показываем лоадер
    if (!isInitialized || isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
            </div>
        );
    }

    // Не авторизован
    if (!isAuthenticated || !user) {
        uiStore.showNotification('Пожалуйста, войдите в аккаунт', 'warning');
        return <Navigate to={redirectTo} replace />;
    }

    // Проверка роли
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            uiStore.showNotification('У вас нет доступа к этой странице', 'error');
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
});