
export function getSafeKeyFromStorage(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key) || null;
    } else {
        return key || '';
    }
}

export function getSafeKeyObjectFromStorage(key: string): any | null {
    if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key) || null;
    }

    return null;
}