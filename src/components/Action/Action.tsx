import { PropsWithChildren, MouseEventHandler } from 'react';
import cn from 'classnames';
import styles from '@/components/Action/Action.module.scss';

type ActionProps = PropsWithChildren<{
    title?: string;
    className?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}>;

export default function Action({
    className, children, title, onClick,
}: ActionProps) {
    return (
        <button className={cn(styles.root, className)} data-tooltip={title} onClick={onClick}>
            {children}
        </button>
    );
}
