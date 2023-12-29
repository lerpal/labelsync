import { PropsWithChildren, useEffect } from 'react';
import cn from 'classnames';
import styles from '@/components/Toast/Toast.module.scss';

type ToastProps = PropsWithChildren<{
    visible: boolean;
    duration: number;
    type?: 'success';
    onHide: () => void;
}>

export default function Toast({
    children, duration, visible, onHide, type = 'success',
}: ToastProps) {
    useEffect(() => {
        let id: NodeJS.Timeout;
        if (visible) {
            id = setTimeout(() => {
                onHide();
            }, duration);
        }

        return () => {
            clearTimeout(id);
        };
    }, [visible, duration, onHide]);

    return (
        <div className={cn(styles.root, styles[`type-${type}`], visible && styles.visible)}>
            {children}
        </div>
    );
}
