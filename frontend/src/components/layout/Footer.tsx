import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.inner}>
                    <span>&copy; Doceum, 2026. Все права защищены</span>
                    <Link to="/about" className={styles.link}>О проекте</Link>
                </div>
            </div>
        </footer>
    );
};