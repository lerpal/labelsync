import React, { useState } from 'react';
import { DataFetcher, SettingsExtended } from '@/types.ts';
import styles from '@/components/CardDetails/CardDetails.module.scss';
import Header from '@/components/Header/Header.tsx';
import Requests from '@/components/CardDetails/Requests.tsx';
import DataFetcherContextProvider from '@/context/DataContext.tsx';
import Refresh from '@/components/Icon/Refresh.tsx';

type LabelsProps = {
    cardId: string;
    settings: SettingsExtended;
    dataFetcher: DataFetcher;
}
export default function CardDetails({ cardId, settings, dataFetcher }:LabelsProps) {
    const [forceRender, setForceRender] = useState<number>(0);

    const handleRootClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
    };
    const handleRefresh = () => {
        setForceRender((v) => v + 1);
    };
    const cardKey = cardId.replace('card-', '');

    return (
        <div onClick={handleRootClick} className={styles.root}>
            <DataFetcherContextProvider dataFetcher={dataFetcher} settings={settings}>
                <Header icon={<Refresh />} title="Refresh" onClick={handleRefresh}>
                    Pull requests
                </Header>
                <Requests cardKey={cardKey} key={forceRender} />
            </DataFetcherContextProvider>
        </div>
    );
}
