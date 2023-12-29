import { ChangeEventHandler } from 'react';
import Item, { ItemProps } from '@/components/Form/Item.tsx';
import styles from '@/components/Form/Checkbox.module.scss';

type CheckboxProps = Pick<ItemProps, 'name' | 'label'> & {
    checked: boolean;
    onChange: ChangeEventHandler<HTMLInputElement>;
};

export default function Checkbox({
    name, label, checked, onChange,
}: CheckboxProps) {
    return (
        <Item name={name} label={label} className={styles.root}>
            <div>
                <input
                    className={styles.btn}
                    type="checkbox"
                    id={name}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                />
                <label htmlFor={name} className={styles.lbl}></label>
            </div>
        </Item>
    );
}
