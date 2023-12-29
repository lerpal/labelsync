import cn from 'classnames';
import { ReviewerData } from '@/types.ts';
import styles from '@/components/CardDetails/Reviewer.module.scss';

type ReviewerProps = {
    reviewer: ReviewerData
    compact?: boolean
}

export default function Reviewer({ reviewer: { login, avatar_url: avatarUrl, state }, compact }: ReviewerProps) {
    return (
        <div className={cn(styles.root, compact && styles.compact)}>
            {!compact && (
                <div className={styles.info}>
                    <img className={styles.image} width="24" height="24" src={avatarUrl} alt={login} />
                    <span className={styles.name}>{login}</span>
                </div>
            )}
            <div
                className={cn(styles.status, styles[`status--${state.toLowerCase()}`])}
                data-tooltip={compact ? login : ''}
            />
        </div>
    );
}
