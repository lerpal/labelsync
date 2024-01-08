import { SELECTORS } from '@/constants.ts';

export function buildArray(value: string): string[] {
    return value.split(',').map((element) => element.trim()).filter(Boolean);
}

export function getColumnsSelector(prColumns: string[]): string {
    const selectors: string[] = [];
    document.querySelectorAll(SELECTORS.columnHeader).forEach((header, index) => {
        const columnTitle = header.getAttribute('aria-label');
        if (!columnTitle) {
            throw new Error('Can\'t find column headers');
        }
        if (prColumns.indexOf(columnTitle) !== -1) {
            selectors.push(`${SELECTORS.column}:nth-child(${index + 1})`);
        }
    });

    return selectors.join(',');
}

export function isHTMLElement(el: Node): el is HTMLElement {
    return el instanceof HTMLElement;
}

export async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return (await response.json()) as T;
}

export async function fetchJiraRest<T>(path: string): Promise<T> {
    return fetchData<T>(`https://${window.location.hostname}/rest${path}`);
}

export function isClosedPR(status: string): boolean {
    return status === 'DECLINED';
}

export function getRGBComponents(color: string): number[] {
    return color.startsWith('rgb')
        ? color.split('(').at(-1)?.split(',').map((p) => parseInt(p.trim(), 10)) || []
        : [1, 3, 5].map((i) => parseInt(color.substring(i, i + 2), 16));
}

export function isLightTheme(): boolean {
    const styles = window.getComputedStyle(document.body);
    return getRGBComponents(styles.getPropertyValue('background-color'))[0] > 200;
}

export function getTextColor(bgColor: string): string {
    const [r, g, b] = getRGBComponents(bgColor);

    const lightnessThreshold = 0.453;
    const lightness = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
    const lightnessSwitch = Math.max(0, Math.min(1 / (lightnessThreshold - lightness), 1));

    return lightnessSwitch ? '#ffffff' : '#000000';
}
