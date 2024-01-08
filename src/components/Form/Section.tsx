import { PropsWithChildren } from 'react';
import styles from '@/components/Form/Section.module.scss';

type SectionProps = PropsWithChildren<{
    title: string;
}>;

export default function Section({ title, children }: SectionProps) {
    return (
        <fieldset className={styles.root}>
            <legend className={styles.title}>{title}</legend>
            {children}
        </fieldset>
    );
}
