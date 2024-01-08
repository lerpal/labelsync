import { useCallback } from 'react';
import { fetchData } from '@/utils/utils.ts';
import { useAsync } from '@/hooks/useAsync.ts';

export function useFetch<T = unknown>(
    url?: string,
    options?: RequestInit,
) {
    const callback = useCallback(() => {
        if (!url) {
            throw new Error('Url not given');
        }
        return fetchData<T>(url, options);
    }, [url, options]);

    return useAsync(callback, url, !url);
}
