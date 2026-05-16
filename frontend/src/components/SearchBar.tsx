import { useState, useEffect, useRef, memo } from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

type SearchType = 'title' | 'author';

interface SearchBarProps {
    onSearch: (query: string, type: SearchType) => void;
}

export const SearchBar = memo(({ onSearch }: SearchBarProps) => {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('title');
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = () => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        onSearch(query, searchType);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('', searchType);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            onSearch(query, searchType);
        }
    };

    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            onSearch(query, searchType);
        }, 1000);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [query, searchType, onSearch]);

    return (
        <div className={styles.container}>
            <div className={styles.toggle}>
                <button
                    className={`${styles.toggleButton} ${searchType === 'title' ? styles.active : ''}`}
                    onClick={() => setSearchType('title')}
                >
                    По названию
                </button>
                <button
                    className={`${styles.toggleButton} ${searchType === 'author' ? styles.active : ''}`}
                    onClick={() => setSearchType('author')}
                >
                    По автору
                </button>
            </div>

            <div className={styles.searchWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={searchType === 'title' ? 'Введите название документа...' : 'Введите имя автора...'}
                    className={styles.input}
                />
                {query && (
                    <button onClick={handleClear} className={styles.clearButton}>
                        <X size={16} />
                    </button>
                )}
                <button
                    onClick={handleSearch}
                    className={styles.searchButton}
                >
                    Найти
                </button>
            </div>
        </div>
    );
});