import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useEnterSubmit } from '@hooks/useEnterSubmit';
import { authStore } from '@stores/AuthStore';
import { uiStore } from '@stores/UiStore';
import styles from './LoginPage.module.css';

export const LoginPage = observer(() => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!email || !password) {
            setError('Заполните все поля');
            return;
        }

        setLoading(true);
        setError(null);
        uiStore.showLoader();

        const success = await authStore.login({ email, password });

        setLoading(false);
        uiStore.hideLoader();

        if (success) {
            navigate('/');
            uiStore.showNotification('Добро пожаловать!', 'success');
        } else {
            setError('Неверный email или пароль');
        }
    };

    const handleKeyDown = useEnterSubmit(handleSubmit);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Вход</h1>
                <p className={styles.subtitle}>Войдите в свой аккаунт Doceum</p>

                <form className={styles.form} onKeyDown={handleKeyDown}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="user@example.com"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="Введите пароль"
                        />
                    </div>

                    {error && (
                        <div className={styles.error}>
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="button" onClick={handleSubmit} disabled={loading} className={styles.submitButton}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Нет аккаунта? <Link to="/register" className={styles.link}>Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
});