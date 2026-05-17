export const isValidEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return regex.test(email);
};

export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 10);
};