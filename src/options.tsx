import React from 'react';
import ReactDOM from 'react-dom/client';
import { Tooltip } from 'react-tooltip';
import Form from '@/components/Form/Form.tsx';
import '@/options.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Form />
        <Tooltip id="tooltip" place="top" />
    </React.StrictMode>,
);

async function updateColor() {
    // chrome..theme.getCurrent(function (theme: any) {
    //     console.log(theme);
    //     // var backgroundColor = theme.colors && theme.colors.ntp_background ? theme.colors.ntp_background : '#ffffff';
    //     // document.body.style.backgroundColor = backgroundColor;
    // });

    // const w = chrome.extension.getViews()[0];
    // console.log(1111, w);
    // // const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    // // console.log(111, tab.id);
    // // if (!tab.id) {
    // //     return;
    // // }
    // // const [{result}] = await chrome.scripting.executeScript({
    // //     target: {tabId: tab.id},
    // //     func: () => getComputedStyle(document.body),
    // // });
    // console.log(2222, w.document.documentElement.style.getPropertyValue('--cr-dialog-background-color'));
    // console.log(2222, w.document.documentElement.style.getPropertyValue('--google-grey-900'));

    // var(--cr-dialog-background-color,var(--google-grey-900))
    // @ts-ignore
    console.log(this);
    console.log(document.documentElement.style.getPropertyValue('--cr-fallback-color-neutral-container'));
    // document.documentElement.style.setProperty('--jle-options-color', result.color);
}

void updateColor();
