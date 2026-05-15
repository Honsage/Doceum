import { Routes, Route } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@components/layout';
import { HomePage } from '@pages/home/HomePage';
import { LocalViewerPage } from '@pages/viewer/LocalViewerPage';
import { LocalPreviewPage } from '@pages/viewer/LocalPreviewPage';

function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/viewer/local" element={<LocalViewerPage />} />
                <Route path="/viewer/local/preview" element={<LocalPreviewPage />} />
            </Route>

            <Route element={<AuthLayout />}>
                {/* Страницы авторизации будут здесь */}
            </Route>
        </Routes>
    );
}

export default App;