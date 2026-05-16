import { Routes, Route } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@components/layout';
import { HomePage } from '@pages/home/HomePage';
import { LocalViewerPage } from '@pages/viewer/LocalViewerPage';
import { LocalPreviewPage } from '@pages/viewer/LocalPreviewPage';
import { LoginPage } from '@pages/auth/LoginPage';
import { RegisterPage } from '@pages/auth/RegisterPage';

function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/viewer/local" element={<LocalViewerPage />} />
                <Route path="/viewer/local/preview" element={<LocalPreviewPage />} />
            </Route>

            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>
        </Routes>
    );
}

export default App;