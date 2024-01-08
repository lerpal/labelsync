import { useCallback } from 'react';
import Loader from '@/components/Loader/Loader.tsx';
import { useDataContext } from '@/context/DataContext.tsx';
import { useAsync } from '@/hooks/useAsync.ts';
import Badge from '@/components/Badge/Badge.tsx';
import styles from '@/components/CardDetails/Labels.module.scss';
import { RequestDetailsData } from '@/types.ts';
import Reviewers from '@/components/CardDetails/Reviewers.tsx';

type LabelsProps = {
    requestData: RequestDetailsData
}

export default function Labels({ requestData }: LabelsProps) {
    const { dataFetcher, settings } = useDataContext();

    const callback = useCallback(
        () => dataFetcher.getRequestDetails(requestData),
        [dataFetcher, requestData],
    );
    const { loading, data } = useAsync(callback);

    return (
        <Loader loading={loading}>
            {() => !!data && (
                <>
                    <div className={styles.root}>
                        {data.labels.map((label) => (
                            <Badge key={label.color} text={label.name} color={label.color} className={styles.label} />
                        ))}
                    </div>
                    {settings.ffCodeReviewers && <Reviewers requestData={requestData} prDetails={data} />}
                </>
            )}
        </Loader>
    );
}
