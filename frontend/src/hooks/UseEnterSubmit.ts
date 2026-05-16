import { useCallback } from 'react';

export const useEnterSubmit = (onSubmit: () => void) => {
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
        }
    }, [onSubmit]);

    return handleKeyDown;
};