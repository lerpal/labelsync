import { useCallback } from 'react';
import Loader from '@/components/Loader/Loader.tsx';
import { useAsync } from '@/hooks/useAsync.ts';
import RequestDetails from '@/components/CardDetails/RequestDetails.tsx';
import { useDataContext } from '@/context/DataContext.tsx';

type RequestsProps = {
    cardKey: string;
}
export default function Requests({ cardKey }: RequestsProps) {
    const { dataFetcher } = useDataContext();
    const callback = useCallback(() => dataFetcher.getRequestsList(cardKey), [dataFetcher, cardKey]);
    const { loading, data } = useAsync(callback);

    return (
        <Loader loading={loading}>
            {() => (
                data?.map((detailsData) => (
                    <RequestDetails data={detailsData} key={detailsData.id} />
                ))
            )}
        </Loader>
    );
}
