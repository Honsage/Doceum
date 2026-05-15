import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@components/ui/ThemeToggle';
import styles from './AuthLayout.module.css';
import logo from '@assets/logo.svg';

const Logo = () => (
    <img src={logo} alt="Doceum" className={styles.logoIcon} />
);

export const AuthLayout = () => {
    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <div className={`container ${styles.inner}`}>
                    <Link to="/" className={styles.logoLink}>
                        <Logo />
                        <span className={styles.title}>Doceum</span>
                    </Link>
                    <ThemeToggle />
                </div>
            </header>
            <main className={styles.main}>
                <Outlet />
            </main>
            <footer className={styles.footer}>
                <div className="container">
                    <span>&copy; Doceum, 2026. Все права защищены.</span>
                </div>
            </footer>
        </div>
    );
};