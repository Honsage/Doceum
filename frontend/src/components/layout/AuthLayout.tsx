import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import styles from './AuthLayout.module.css';

export const AuthLayout = () => {
    return (
        <div className={styles.layout}>
            <Header />
            <main className={styles.main}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};