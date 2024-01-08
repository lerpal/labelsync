import { useEffect, useReducer, useRef } from 'react';

interface State<T> {
    data?: T
    error?: Error
    loading: boolean
}

type Cache<T> = { [url: string]: T }

type Action<T> =
    | { type: 'loading' }
    | { type: 'fetched'; payload: T }
    | { type: 'error'; payload: Error }

function useAsyncState<T = unknown>() {
    const initialState: State<T> = {
        error: undefined,
        data: undefined,
        loading: false,
    };

    // Keep state logic separated
    const asyncReducer = (state: State<T>, action: Action<T>): State<T> => {
        switch (action.type) {
        case 'loading':
            return { ...initialState, loading: true };
        case 'fetched':
            return { ...initialState, data: action.payload, loading: false };
        case 'error':
            return { ...initialState, error: action.payload, loading: false };
        default:
            return state;
        }
    };

    return useReducer(asyncReducer, initialState);
}

export function useAsync<T = unknown>(
    callback: () => Promise<T>,
    cacheKey?: string,
    skipCall?: boolean,
): State<T> {
    const cache = useRef<Cache<T>>({});

    // Used to prevent state update if the component is unmounted
    const cancelRequest = useRef<boolean>(false);

    const [state, dispatch] = useAsyncState<T>();

    useEffect(() => {
        if (skipCall) return () => {};

        cancelRequest.current = false;

        const sendRequest = async () => {
            dispatch({ type: 'loading' });

            // If a cache exists for this url, return it
            if (cacheKey && cache.current[cacheKey]) {
                dispatch({ type: 'fetched', payload: cache.current[cacheKey] });
                return;
            }

            try {
                const data = await callback();
                if (cacheKey) {
                    cache.current[cacheKey] = data;
                }
                if (cancelRequest.current) return;

                dispatch({ type: 'fetched', payload: data });
            } catch (error) {
                if (cancelRequest.current) return;

                dispatch({ type: 'error', payload: error as Error });
            }
        };

        sendRequest();

        return () => {
            cancelRequest.current = true;
        };
    }, [callback, cacheKey, dispatch, skipCall]);

    return state;
}
