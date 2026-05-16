import { Routes, Route } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@components/layout';
import { ProtectedRoute} from '@components/ProtectedRoute.tsx';
import { HomePage } from '@pages/home/HomePage';
import { LocalViewerPage } from '@pages/viewer/LocalViewerPage';
import { LocalPreviewPage } from '@pages/viewer/LocalPreviewPage';
import { LoginPage } from '@pages/auth/LoginPage';
import { RegisterPage } from '@pages/auth/RegisterPage';
import { ProfilePage } from '@pages/profile/ProfilePage';
import { LibraryPage } from '@pages/library/LibraryPage';
import { ViewerPage } from '@pages/viewer/ViewerPage';

function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/viewer/local" element={<LocalViewerPage />} />
                <Route path="/viewer/local/preview" element={<LocalPreviewPage />} />

                // Для любых аутентифицированных пользователей
                <Route element={<ProtectedRoute />}>
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/viewer/:id" element={<ViewerPage />} />
                </Route>

                // Для авторов
                <Route element={<ProtectedRoute allowedRoles={['AUTHOR', 'ADMIN']} />}>
                    <Route path="/editor" element={null/*<EditorPage />*/} />
                    <Route path="/editor/:documentId" element={null/*<EditorPage />*/} />
                </Route>
            </Route>

            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>
        </Routes>
    );
}

export default App;