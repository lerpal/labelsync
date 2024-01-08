import React from 'react';
import styles from './Loader.module.scss';

type LoaderProps = {
    loading: boolean;
    children: () => React.ReactNode;
}
export default function Loader({ loading, children }: LoaderProps) {
    return loading
        ? <div className={styles.root}><div className={styles.loader} /></div>
        : children();
}
