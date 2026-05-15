import { observer } from 'mobx-react-lite';
import { Sun, Moon } from 'lucide-react';
import { uiStore } from '@stores/UiStore';
import styles from './ThemeToggle.module.css';

export const ThemeToggle = observer(() => {
    const { theme, toggleTheme } = uiStore;

    return (
        <button onClick={toggleTheme} className={styles.toggle} aria-label="Переключить тему">
            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
});