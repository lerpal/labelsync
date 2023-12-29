import {
    createContext, PropsWithChildren, JSX, useContext, useMemo,
} from 'react';
import { DataFetcher, SettingsExtended } from '@/types.ts';
import GitHubFetcher from '@/data/GitHubFetcher.ts';
import { INITIAL_SETTINGS } from '@/constants.ts';

type DataContextData = {
    dataFetcher: DataFetcher
    settings: SettingsExtended
}

const DataContext = createContext<DataContextData>({
    dataFetcher: new GitHubFetcher(''),
    settings: {
        ...INITIAL_SETTINGS,
        codeReviewersLabels: [],
        prColumns: [],
    },
});

export function useDataContext(): DataContextData {
    return useContext(DataContext);
}

type DataContextProviderProps = PropsWithChildren<DataContextData>;

export default function DataContextProvider({ dataFetcher, settings, children }: DataContextProviderProps): JSX.Element {
    const value = useMemo<DataContextData>(
        () => ({ dataFetcher, settings }),
        [dataFetcher, settings],
    );
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
