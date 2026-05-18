import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Users, Shield } from 'lucide-react';
import styles from './AboutPage.module.css';

export const AboutPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>О платформе</h1>

                <p className={styles.description}>
                    Doceum — это платформа для создания, публикации и просмотра интерактивных документов.
                </p>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>
                            <FileText size={24} />
                        </div>
                        <h3 className={styles.featureTitle}>Интерактивные документы</h3>
                        <p className={styles.featureDesc}>
                            Вкладки, степперы, аккордеоны, квизы — формат .doceo позволяет создавать
                            пошаговые инструкции и учебные материалы.
                        </p>
                    </div>

                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>
                            <Users size={24} />
                        </div>
                        <h3 className={styles.featureTitle}>Для авторов и читателей</h3>
                        <p className={styles.featureDesc}>
                            Авторы создают документы в визуальном редакторе, читатели просматривают их
                            в удобном ридере.
                        </p>
                    </div>

                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>
                            <Shield size={24} />
                        </div>
                        <h3 className={styles.featureTitle}>Верификация документов</h3>
                        <p className={styles.featureDesc}>
                            Каждый документ подписывается сервером, что гарантирует его целостность
                            и подтверждает авторство.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};