import { JSX } from 'react';
import { RequestDetailsData } from '@/types.ts';
import Arrow from '@/components/Icon/Arrow.tsx';
import Badge from '@/components/Badge/Badge.tsx';
import { isClosedPR } from '@/utils/utils.ts';
import Labels from '@/components/CardDetails/Labels.tsx';
import { useDataContext } from '@/context/DataContext.tsx';
import styles from './RequestDetails.module.scss';

const STATUS_COLOR: Record<string, string> = {
    OPEN: '#1f883d',
    OPENED: '#1f883d',
    MERGED: '#8250df',
    DECLINED: '#cf222e',
    CLOSED: '#cf222e',
    DEFAULT: '#555555',
};

type RequestDetailsProps = {
    data: RequestDetailsData;
}
export default function RequestDetails({ data }: RequestDetailsProps): JSX.Element {
    const { settings } = useDataContext();
    const {
        id, repositoryName, url, status,
    } = data;

    const isClosed = isClosedPR(status);
    if (isClosed && settings.hideClosedPRs) {
        return <></>;
    }
    const showLabels = !isClosed || !settings.hideLabelsOnClosedPRs;

    const repo = settings.ffShortName ? repositoryName.split('/').at(-1) : repositoryName;
    const statusColor = STATUS_COLOR[status.toUpperCase()] || STATUS_COLOR.DEFAULT;

    return (
        <>
            <a className={styles.root} href={url} target="_blank" rel="noreferrer">
                <span className={styles.info}>
                    <span className={styles.repo}>{repo}</span>
                    <Arrow />
                    <span>#{id}</span>
                </span>
                <Badge text={status.toUpperCase()} color={statusColor} useColorAsBg />
            </a>
            {showLabels && <Labels requestData={data} />}
        </>
    );
}
