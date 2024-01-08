import { PropsWithChildren } from 'react';
import cn from 'classnames';
import styles from '@/components/Form/Item.module.scss';

export type ItemProps = PropsWithChildren<{
    name: string
    label?: string
    className?: string
    tip?: string
}>;

export default function Item({
    name, label, className, tip, children,
}: ItemProps) {
    return (
        <div className={cn(styles.root, className)}>
            {!!label && <label className={styles.label} htmlFor={name}>
                {label}
                {tip ? <span className={styles.help} data-tooltip-id="tooltip" data-tooltip-content={tip}>?</span> : ''}
            </label>}
            {children}
        </div>
    );
}
