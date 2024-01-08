import {CSSProperties} from 'react';
import cn from 'classnames';
import styles from '@/components/Badge/Badge.module.scss';
import { getRGBComponents, getTextColor, isLightTheme } from '@/utils/utils.ts';

type BadgeProps = {
    text: string;
    color: string;
    className?: string;
    useColorAsBg?: boolean;
}
export default function Badge({
    text, color, className, useColorAsBg = false,
}: BadgeProps) {
    return (
        <span className={cn(styles.root, className)} style={getLabelColors(color, useColorAsBg)}>
            {text}
        </span>
    );
}

function getLabelColors(color: string, useColorAsBg: boolean): CSSProperties {
    if (useColorAsBg || isLightTheme()) {
        return {
            color: getTextColor(color),
            backgroundColor: color,
            borderColor: color,
        };
    }

    const rgb = getRGBComponents(color);
    return {
        color,
        backgroundColor: `rgba(${rgb.join(', ')}, 0.16)`,
        borderColor: color,
    };
}
