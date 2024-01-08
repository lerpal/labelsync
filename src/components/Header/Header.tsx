import { PropsWithChildren, ReactNode } from 'react';
import cn from 'classnames';
import Action from '@/components/Action/Action.tsx';
import styles from '@/components/Header/Header.module.scss';

type HeaderProps = PropsWithChildren<{
    className?: string
    rightSide?: ReactNode
    icon?: ReactNode
    title?: string
    actionClassName?: string
    onClick?: () => void
}>

export default function Header({
    children, icon, title, onClick, actionClassName, rightSide, className,
}: HeaderProps) {
    return <div className={cn(styles.root, className)}>
        <p>{children}</p>
        {!!icon
            && <Action title={title} onClick={onClick} className={actionClassName}>
                {icon}
            </Action>
        }
        {!!rightSide && <div className={styles.right}>{rightSide}</div>}
    </div>;
}
