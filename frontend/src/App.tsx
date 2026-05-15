import { Routes, Route } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@components/layout';
import { HomePage } from '@pages/home/HomePage';
import styles from './App.module.css';

function App() {
    return (
        <div className={styles.app}>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                </Route>

                <Route element={<AuthLayout />}>
                    {/* Страницы авторизации */}
                </Route>
            </Routes>
        </div>
    );
}

export default App;