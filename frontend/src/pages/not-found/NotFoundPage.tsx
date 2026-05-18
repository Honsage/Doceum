import { Link } from 'react-router-dom';
import { Home, BookOpen, ArrowRight } from 'lucide-react';
import styles from './NotFoundPage.module.css';

export const NotFoundPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.code}>404</div>
                <h1 className={styles.title}>Страница не найдена</h1>
                <p className={styles.description}>
                    К сожалению, запрошенная страница не существует или была перемещена.
                    Возможно, вы перешли по устаревшей ссылке или допустили опечатку в адресе.
                </p>
                <div className={styles.actions}>
                    <Link to="/" className={styles.button}>
                        <Home size={18} />
                        <span>На главную</span>
                    </Link>
                    <Link to="/about" className={`${styles.button} ${styles.outline}`}>
                        <BookOpen size={18} />
                        <span>О проекте</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
};