import { ChangeEventHandler } from 'react';
import Item, { ItemProps } from '@/components/Form/Item.tsx';
import styles from '@/components/Form/Input.module.scss';

export type InputProps = Pick<ItemProps, 'name' | 'label' | 'tip'> & {
    value?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
};

export default function Input({
    name, label, value, tip, onChange,
}: InputProps) {
    return (
        <Item name={name} label={label} tip={tip}>
            <input
                className={styles.root}
                id={name}
                name={name}
                type="text"
                value={value}
                onChange={onChange}
            />
        </Item>
    );
}
