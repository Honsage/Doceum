import { useState, useEffect, useCallback } from 'react';
import { SearchBar } from '@components/SearchBar';
import { DocumentCard } from '@components/DocumentCard';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { hubApi } from '@services/api/hub';
import { uiStore } from '@stores/UiStore';
import type { DocumentMetadata, SearchResponse } from '@types/api';
import styles from './LibraryPage.module.css';

type SearchType = 'title' | 'author';

export const LibraryPage = () => {
    const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('title');
    const [isSearching, setIsSearching] = useState(false);

    const limit = 10;
    const offset = (currentPage - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    const loadDocuments = useCallback(async () => {
        setLoading(true);

        try {
            let response: SearchResponse<DocumentMetadata>;

            if (isSearching && searchQuery.trim()) {
                if (searchType === 'title') {
                    response = await hubApi.searchByTitle(searchQuery, limit, offset);
                } else {
                    response = await hubApi.searchByAuthor(searchQuery, limit, offset);
                }
            } else {
                response = await hubApi.getRecent(limit, offset);
            }

            setDocuments(response.items);
            setTotal(response.pagination.total);
        } catch (err) {
            uiStore.showNotification('Ошибка загрузки документов', 'error');
            setDocuments([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [offset, isSearching, searchQuery, searchType]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    const handleSearch = useCallback((query: string, type: SearchType) => {
        setSearchQuery(query);
        setSearchType(type);
        setIsSearching(!!query.trim());
        setCurrentPage(1);
    }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFavoriteToggle = () => {
        loadDocuments();
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages: number[] = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className={styles.pagination}>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.pageButton}
                    aria-label="Предыдущая страница"
                >
                    <ChevronLeft size={16} />
                </button>

                {startPage > 1 && (
                    <>
                        <button onClick={() => handlePageChange(1)} className={styles.pageButton}>
                            1
                        </button>
                        {startPage > 2 && <span className={styles.dots}>...</span>}
                    </>
                )}

                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`${styles.pageButton} ${page === currentPage ? styles.active : ''}`}
                    >
                        {page}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className={styles.dots}>...</span>}
                        <button onClick={() => handlePageChange(totalPages)} className={styles.pageButton}>
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.pageButton}
                    aria-label="Следующая страница"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Библиотека</h1>

            <SearchBar onSearch={handleSearch} />

            <div className={styles.resultsInfo}>
                {!loading && (
                    <>Найдено: {total} {total === 1 ? 'документ' : total < 5 ? 'документа' : 'документов'}</>
                )}
            </div>

            <div className={styles.grid}>
                {loading ? (
                    <div className={styles.loadingSpinner}>
                        <div className={styles.spinner} />
                    </div>
                ) : documents.length === 0 ? (
                    <div className={styles.empty}>
                        <Search size={48} strokeWidth={1} />
                        <h3 className={styles.emptyTitle}>Ничего не найдено</h3>
                        <p className={styles.emptyText}>
                            {isSearching
                                ? `По запросу "${searchQuery}" ничего не найдено. Попробуйте изменить условия поиска.`
                                : 'В библиотеке пока нет документов'}
                        </p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            document={doc}
                            onFavoriteToggle={handleFavoriteToggle}
                        />
                    ))
                )}
            </div>

            {!loading && renderPagination()}
        </div>
    );
};