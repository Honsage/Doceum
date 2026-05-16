import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEnterSubmit } from '@hooks/useEnterSubmit';
import { authStore } from '@stores/AuthStore';
import { uiStore } from '@stores/UiStore';
import styles from './RegisterPage.module.css';

type UserRole = 'READER' | 'AUTHOR';

export const RegisterPage = observer(() => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<UserRole>('READER');

    // Шаг 1: учётные данные
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // Шаг 2: личные данные
    const [surname, setSurname] = useState('');
    const [name, setName] = useState('');
    const [patronymic, setPatronymic] = useState('');
    const [personalError, setPersonalError] = useState<string | null>(null);

    // Шаг 3: профессиональные данные (только AUTHOR)
    const [organization, setOrganization] = useState('');
    const [position, setPosition] = useState('');

    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isAuthor = role === 'AUTHOR';
    const totalSteps = isAuthor ? 3 : 2;

    // Валидация email
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateStep1 = (): boolean => {
        // Очищаем предыдущие ошибки
        setEmailError(null);
        setPasswordError(null);

        if (!email) {
            setEmailError('Введите email');
            return false;
        }
        if (!validateEmail(email)) {
            setEmailError('Введите корректный email');
            return false;
        }
        if (!password) {
            setPasswordError('Введите пароль');
            return false;
        }
        if (password.length < 6) {
            setPasswordError('Пароль должен содержать не менее 6 символов');
            return false;
        }
        if (password !== confirmPassword) {
            setPasswordError('Пароли не совпадают');
            return false;
        }
        return true;
    };

    const validateStep2 = (): boolean => {
        setPersonalError(null);

        if (!surname || !name) {
            setPersonalError('Заполните фамилию и имя');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            if (isAuthor) {
                setStep(3);
            } else {
                handleSubmit();
            }
        } else if (step === 3) {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            setSubmitError(null);
            setEmailError(null);
            setPasswordError(null);
            setPersonalError(null);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setSubmitError(null);
        uiStore.showLoader();

        const registerData = {
            email,
            password,
            surname,
            name,
            patronymic: patronymic || undefined,
            ...(isAuthor && { organization: organization || undefined, position: position || undefined }),
        };

        const success = await authStore.register(registerData);

        setLoading(false);
        uiStore.hideLoader();

        if (success) {
            navigate('/');
            uiStore.showNotification('Регистрация прошла успешно!', 'success');
        } else {
            setSubmitError(authStore.error || 'Ошибка регистрации');
        }
    };

    const handleKeyDown = useEnterSubmit(handleNext);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Регистрация</h1>
                <p className={styles.subtitle}>Создайте аккаунт в Doceum</p>

                {/* Индикатор шагов */}
                <div className={styles.steps} data-count={totalSteps}>
                    {Array.from({ length: totalSteps }).map((_, idx) => (
                        <div key={idx} className={styles.stepWrapper}>
                            <div
                                className={`${styles.step} ${
                                    step === idx + 1 ? styles.active : ''
                                } ${step > idx + 1 ? styles.completed : ''}`}
                            >
                                <div className={styles.stepNumber}>{idx + 1}</div>
                                <div className={styles.stepLabel}>
                                    {idx === 0 ? 'Учётные данные' : idx === 1 ? 'Личные данные' : 'Проф. данные'}
                                </div>
                            </div>
                            {idx < totalSteps - 1 && <div className={styles.stepLine} />}
                        </div>
                    ))}
                </div>

                <form onKeyDown={handleKeyDown} className={styles.form}>
                    {/* Шаг 1: Учётные данные */}
                    {step === 1 && (
                        <div className={styles.stepContent}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) setEmailError(null);
                                    }}
                                    className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                                    placeholder="user@example.com"
                                />
                                {emailError && (
                                    <div className={styles.fieldError}>{emailError}</div>
                                )}
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Пароль</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (passwordError) setPasswordError(null);
                                    }}
                                    className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
                                    placeholder="Введите пароль"
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Подтверждение пароля</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (passwordError) setPasswordError(null);
                                    }}
                                    className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
                                    placeholder="Повторите пароль"
                                />
                            </div>

                            {passwordError && (
                                <div className={styles.fieldError}>{passwordError}</div>
                            )}
                        </div>
                    )}

                    {/* Шаг 2: Личные данные */}
                    {step === 2 && (
                        <div className={styles.stepContent}>
                            <div className={styles.row}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Фамилия</label>
                                    <input
                                        type="text"
                                        value={surname}
                                        onChange={(e) => {
                                            setSurname(e.target.value);
                                            if (personalError) setPersonalError(null);
                                        }}
                                        className={styles.input}
                                        placeholder="Иванов"
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Имя</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            if (personalError) setPersonalError(null);
                                        }}
                                        className={styles.input}
                                        placeholder="Иван"
                                    />
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Отчество (опционально)</label>
                                <input
                                    type="text"
                                    value={patronymic}
                                    onChange={(e) => setPatronymic(e.target.value)}
                                    className={styles.input}
                                    placeholder="Иванович"
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Роль</label>
                                <div className={styles.radioGroup}>
                                    <label className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            value="READER"
                                            checked={role === 'READER'}
                                            onChange={() => setRole('READER')}
                                        />
                                        <span>Читатель</span>
                                        <small>Просмотр документов, избранное</small>
                                    </label>
                                    <label className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            value="AUTHOR"
                                            checked={role === 'AUTHOR'}
                                            onChange={() => setRole('AUTHOR')}
                                        />
                                        <span>Автор</span>
                                        <small>Создание и публикация документов</small>
                                    </label>
                                </div>
                            </div>

                            {personalError && (
                                <div className={styles.error}>{personalError}</div>
                            )}
                        </div>
                    )}

                    {/* Шаг 3: Профессиональные данные (только AUTHOR) */}
                    {step === 3 && isAuthor && (
                        <div className={styles.stepContent}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Организация</label>
                                <input
                                    type="text"
                                    value={organization}
                                    onChange={(e) => setOrganization(e.target.value)}
                                    className={styles.input}
                                    placeholder="Например: МГУ"
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Должность</label>
                                <input
                                    type="text"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    className={styles.input}
                                    placeholder="Например: Профессор"
                                />
                            </div>
                        </div>
                    )}

                    {/* Общая ошибка (например, с сервера) */}
                    {submitError && (
                        <div className={styles.error}>
                            <span>{submitError}</span>
                        </div>
                    )}

                    <div className={styles.actions}>
                        {step > 1 && (
                            <button type="button" onClick={handleBack} className={styles.backButton}>
                                <ArrowLeft size={16} />
                                Назад
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={loading}
                            className={`${styles.nextButton} ${step === 1 && !isAuthor ? styles.fullWidth : ''}`}
                        >
                            {step === totalSteps ? (
                                loading ? 'Регистрация...' : 'Зарегистрироваться'
                            ) : (
                                <>
                                    Далее
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className={styles.footer}>
                    Уже есть аккаунт? <Link to="/login" className={styles.link}>Войти</Link>
                </p>
            </div>
        </div>
    );
});