import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from '@stores/AuthStore';
import { User, Star, FileText } from 'lucide-react';
import { PersonalInfoTab } from './tabs/PersonalInfoTab';
import { FavoritesTab } from './tabs/FavoritesTab';
import { MyDocumentsTab } from './tabs/MyDocumentsTab';
import styles from './ProfilePage.module.css';

type Tab = 'personal' | 'favorites' | 'documents';

export const ProfilePage = observer(() => {
    const { isAuthor } = authStore;
    const [activeTab, setActiveTab] = useState<Tab>('personal');

    const tabs = [
        { id: 'personal' as Tab, label: 'Личные данные', icon: User, show: true },
        { id: 'favorites' as Tab, label: 'Избранное', icon: Star, show: true },
        { id: 'documents' as Tab, label: 'Мои документы', icon: FileText, show: isAuthor },
    ].filter(tab => tab.show);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Профиль</h1>

            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {activeTab === 'personal' && <PersonalInfoTab />}
                {activeTab === 'favorites' && <FavoritesTab />}
                {activeTab === 'documents' && <MyDocumentsTab />}
            </div>
        </div>
    );
});