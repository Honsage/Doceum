import { observer } from 'mobx-react-lite';
import { authStore } from '@stores/AuthStore';
import styles from './PersonalInfoTab.module.css';

export const PersonalInfoTab = observer(() => {
    const { user, isAuthor } = authStore;

    if (!user) return null;

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Основная информация</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Email</span>
                        <span className={styles.value}>{user.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Роль</span>
                        <span className={styles.value}>
              {user.role === 'AUTHOR' ? 'Автор' : user.role === 'READER' ? 'Читатель' : 'Администратор'}
            </span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Личные данные</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Фамилия</span>
                        <span className={styles.value}>{user.surname}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Имя</span>
                        <span className={styles.value}>{user.name}</span>
                    </div>
                    {user.patronymic && (
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Отчество</span>
                            <span className={styles.value}>{user.patronymic}</span>
                        </div>
                    )}
                </div>
            </div>

            {isAuthor && (user.organization || user.position) && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Профессиональная информация</h2>
                    <div className={styles.infoGrid}>
                        {user.organization && (
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Организация</span>
                                <span className={styles.value}>{user.organization}</span>
                            </div>
                        )}
                        {user.position && (
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Должность</span>
                                <span className={styles.value}>{user.position}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});