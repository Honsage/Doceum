import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ThemeToggle } from '@components/ui/ThemeToggle';
import { authStore } from '@stores/AuthStore';
import styles from './Header.module.css';
import logo from '@assets/logo.svg';

const Logo = () => (
    <img src={logo} alt="Doceum" className={styles.logoIcon} />
);

export const Header = observer(() => {
    const { user, isAuthenticated, isAuthor } = authStore;

    return (
        <header className={styles.header}>
            <div className={`container ${styles.inner}`}>
                {/* Логотип и название */}
                <Link to="/" className={styles.logoLink}>
                    <Logo />
                    <span className={styles.title}>Doceum</span>
                </Link>

                {/* Навигация */}
                <nav className={styles.nav}>
                    <Link to="/viewer/local" className={styles.navLink}>Просмотр</Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/library" className={styles.navLink}>Библиотека</Link>
                            {isAuthor && (
                                <Link to="/editor" className={styles.navLink}>Редактор</Link>
                            )}
                            <Link to="/profile" className={styles.navLink}>Профиль</Link>
                            <button onClick={() => authStore.logout()} className={styles.navButton}>
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={styles.navLink}>Войти</Link>
                            <Link to="/register" className={styles.navLink}>Зарегистрироваться</Link>
                        </>
                    )}

                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
});