import { useCallback } from 'react';
import cn from 'classnames';
import { useDataContext } from '@/context/DataContext.tsx';
import { useAsync } from '@/hooks/useAsync.ts';
import { PullRequestDetailsData, RequestDetailsData } from '@/types.ts';
import Header from '@/components/Header/Header.tsx';
import Arrow from '@/components/Icon/Arrow.tsx';
import useFlag from '@/hooks/useFlag.ts';
import Loader from '@/components/Loader/Loader.tsx';
import Reviewer from '@/components/CardDetails/Reviewer.tsx';
import styles from '@/components/CardDetails/Reviewers.module.scss';

type ReviewersProps = {
    requestData: RequestDetailsData
    prDetails: PullRequestDetailsData
}

export default function Reviewers({ requestData, prDetails }: ReviewersProps) {
    const { dataFetcher, settings } = useDataContext();

    const callback = useCallback(
        () => dataFetcher.getRequestReviewers(requestData, prDetails),
        [dataFetcher, requestData, prDetails],
    );
    const { loading, data } = useAsync(callback);
    const [reviewersVisible, showReviewers, hideReviewers] = useFlag(true);

    const isCompact = settings.ffCompactReviewers;
    const reviewersList = (
        <Loader loading={loading}>
            {() => reviewersVisible && data?.map((reviewer) => (
                <Reviewer reviewer={reviewer} key={reviewer.login} compact={isCompact} />
            ))}
        </Loader>
    );

    return isCompact
        ? <Header className={styles.compact} rightSide={reviewersList}>Reviewers:</Header>
        : (
            <>
                <Header
                    icon={<Arrow />}
                    title="Toggle"
                    onClick={reviewersVisible ? hideReviewers : showReviewers}
                    actionClassName={cn(styles.action, reviewersVisible && styles.opened)}
                >
                    Reviewers
                </Header>
                {reviewersList}
            </>
        );
}
