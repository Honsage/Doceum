import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Sparkles, Shield, BookOpen, Eye } from 'lucide-react';
import { authStore } from '@stores/AuthStore';
import { uiStore } from '@stores/UiStore';
import { documentsApi } from '@services/api/documents';
import { Tabs } from '@components/blocks';
import styles from './HomePage.module.css';

export const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isAuthor } = authStore;

    const handleCreateDocument = async () => {
        if (!isAuthenticated || !isAuthor) {
            navigate('/login');
            return;
        }

        uiStore.showLoader();

        try {
            const response = await documentsApi.create({
                title: 'Новый документ',
                description: '',
            });
            navigate(`/editor/${response.id}`);
        } catch (err) {
            uiStore.showNotification('Ошибка создания документа', 'error');
        } finally {
            uiStore.hideLoader();
        }
    };

    // Реальный блок Tabs для демонстрации
    const demoBlock = {
        id: 'demo-tabs',
        type: 'tabs',
        children: [
            {
                id: 'tab-unix',
                type: 'tab_item',
                label: {
                    type: 'text',
                    inlines: [{ type: 'span', text: 'Unix / macOS', marks: [] }]
                },
                children: [
                    {
                        id: 'code-unix',
                        type: 'code',
                        language: 'bash',
                        code: 'source venv/bin/activate'
                    }
                ]
            },
            {
                id: 'tab-windows',
                type: 'tab_item',
                label: {
                    type: 'text',
                    inlines: [{ type: 'span', text: 'Windows', marks: [] }]
                },
                children: [
                    {
                        id: 'code-windows',
                        type: 'code',
                        language: 'cmd',
                        code: 'venv\\Scripts\\activate.bat'
                    }
                ]
            }
        ]
    };

    // Заглушка для getMediaUrl (в демо нет изображений)
    const getMediaUrlStub = () => '';

    return (
        <div className={styles.home}>
            {/* Hero секция */}
            <section className={styles.hero}>
                <div className={styles.container}>
                    <h1 className={styles.title}>
                        Интерактивные документы<br />
                        <span className={styles.highlight}>нового поколения</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Создавайте, публикуйте и просматривайте документы с интерактивными элементами:
                        вкладки, степперы, квизы и не только.
                    </p>
                    <div className={styles.buttons}>
                        {isAuthenticated && isAuthor ? (
                            <button onClick={handleCreateDocument} className={styles.buttonPrimary}>
                                <Sparkles size={18} />
                                Создать документ
                            </button>
                        ) : (
                            <Link to="/register" className={styles.buttonPrimary}>
                                Начать работу
                                <ArrowRight size={18} />
                            </Link>
                        )}
                        <Link to="/library" className={styles.buttonSecondary}>
                            <BookOpen size={18} />
                            Библиотека
                        </Link>
                    </div>
                </div>
            </section>

            {/* Возможности */}
            <section className={styles.features}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Что вы можете с Doceum</h2>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <FileText size={24} />
                            </div>
                            <h3>Интерактивный формат</h3>
                            <p>Документы с вкладками, степперами, аккордеонами, квизами и другими интерактивными блоками.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <Shield size={24} />
                            </div>
                            <h3>Верификация подписи</h3>
                            <p>Каждый документ подписывается сервером — вы всегда можете проверить целостность и авторство.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <Eye size={24} />
                            </div>
                            <h3>Удобный просмотр</h3>
                            <p>Загружайте локальные файлы .doceo или смотрите опубликованные документы в библиотеке.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Демо секция с реальным Tabs блоком */}
            <section className={styles.demo}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Как это выглядит</h2>
                    <div className={styles.demoCard}>
                        <div className={styles.demoHeader}>
                            <div className={styles.demoTitle}>Активация виртуального окружения Python</div>
                            <div className={styles.demoBadge}>Интерактивный блок</div>
                        </div>
                        <div className={styles.demoContent}>
                            <Tabs
                                block={demoBlock}
                                getMediaUrl={getMediaUrlStub}
                                onAnchorClick={() => {}}
                            />
                        </div>
                        <div className={styles.demoFooter}>
                            <Link to="/library" className={styles.demoLink}>
                                Посмотреть примеры документов
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};