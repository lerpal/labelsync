import {
    ChangeEvent, Children, cloneElement, isValidElement, JSX, ReactElement,
} from 'react';
import Item from '@/components/Form/Item.tsx';
import styles from '@/components/Form/InputGroup.module.scss';
import { InputProps } from '@/components/Form/Input.tsx';
import { SettingsChangeEvent } from '@/types.ts';

type InputGroupProps<T> = {
    name: string
    label: string
    value: T[]
    emptyValue: T
    onChange: (e: SettingsChangeEvent<T[]>) => void
    children: ReactElement<InputProps> | ReactElement<InputProps>[]
}

export default function InputGroup<T extends Record<string, string>>({
    name, label, value, emptyValue, children, onChange,
}: InputGroupProps<T>): JSX.Element {
    const isDisabled = value.length === 1;
    const changeValue = (v: T[]) => {
        onChange({ target: { name, value: v } });
    };

    const handleAdd = () => {
        changeValue([...value, emptyValue]);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>, rowIndex: number, childName: string) => {
        changeValue(value.map((item, index) => (
            index === rowIndex
                ? { ...item, [childName]: e.target.value }
                : item
        )));
    };

    const handleRemove = (rowIndex: number) => () => {
        if (isDisabled) {
            return;
        }
        changeValue(value.filter((_item, index) => (
            index !== rowIndex
        )));
    };

    return (
        <Item name={name} label={label}>
            {value.map((item, index) => (
                <div className={styles.row} key={index}>
                    {
                        Children.map(children, (child) => {
                            if (isValidElement(child)) {
                                return cloneElement(child, {
                                    name: `name[${index}].${child.props.name}`,
                                    value: item[child.props.name],
                                    onChange: (e: ChangeEvent<HTMLInputElement>) => (
                                        handleChange(e, index, child.props.name)
                                    ),
                                });
                            }
                            return child;
                        })
                    }
                    <button
                        className={styles.remove}
                        type="button"
                        onClick={handleRemove(index)}
                        disabled={isDisabled}
                        data-tooltip-id="tooltip"
                        data-tooltip-content={isDisabled ? '' : 'Remove'}
                    >&times;</button>
                </div>
            ))}
            <div className={styles.footer}>
                <button className={styles.add} type="button" onClick={handleAdd}>Add</button>
            </div>
        </Item>
    );
}
