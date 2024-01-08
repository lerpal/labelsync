import {INITIAL_SETTINGS, SELECTORS} from '@/constants.ts';
import {DataFetcher, GitLabSettings, SettingsExtended} from './types.ts';
import {buildArray, getColumnsSelector, isHTMLElement, isLightTheme} from '@/utils/utils.ts';
import ReactDOM from 'react-dom/client';
import CardDetails from '@/components/CardDetails/CardDetails.tsx';
import GitHubFetcher from '@/data/GitHubFetcher.ts';
import GitLabFetcher from '@/data/GitLabFetcher.ts';
import '@/data-tooltip.css';
import styles from '@/content.module.scss';

let settings: SettingsExtended;
let columnsSelector: string = '';
const cachedLabels: Record<string, HTMLElement> = {};
let dataFetcher: DataFetcher;

chrome.storage.sync.get(INITIAL_SETTINGS, (items) => {
    settings = {
        ...items,
        codeReviewersLabels: buildArray(items.codeReviewersLabels as string),
        prColumns: buildArray(items.prColumns as string),
    } as SettingsExtended;

    setTimeout(addPRLabels, 1500);
});

async function populateIssueCard(card: HTMLElement) {
    const idAttr = card.getAttribute('id') || card.dataset.id;
    if (!idAttr) {
        throw new Error('Id attribute is absent');
    }
    if (!cachedLabels[idAttr]) {
        cachedLabels[idAttr] = document.createElement('div');

        ReactDOM.createRoot(cachedLabels[idAttr]).render(
            <CardDetails cardId={idAttr} settings={settings} dataFetcher={dataFetcher} />
        );
    }

    card.querySelector(SELECTORS.labelsContainer)?.before(cachedLabels[idAttr]);
}

function watchCards(mutations: MutationRecord[]) {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (!isHTMLElement(node)) {
                return;
            }
            let card = node.querySelector<HTMLElement>(SELECTORS.card);
            const container = node.querySelector<HTMLElement>(SELECTORS.labelsContainer);
            if (!card && container) {
                // Need to extract the ticket name. A bit hacky, but it works.
                const cardName = container.parentElement?.nextElementSibling?.nextElementSibling?.textContent || '';
                node.dataset.id = `card-${cardName}`;
                card = node;
            }
            // Check card and parent column.
            if (card && card.closest(columnsSelector)) {
                void populateIssueCard(card);
            }
        });
    });
}

function getGitLabSettings(settings: SettingsExtended): GitLabSettings | undefined {
    const projectName = location.pathname.split('/').at(5);
    return settings.gitlab.filter((item) => item.projectName === projectName)[0];
}

function addPRLabels(): void {
    columnsSelector = getColumnsSelector(settings.prColumns);

    if (!columnsSelector) {
        throw new Error('Empty columns selector');
    }

    const board = document.querySelector(SELECTORS.board);
    if (!board) {
        throw new Error('Invalid board selector');
    }

    if (isLightTheme()) {
        document.body.classList.add(styles.light);
    }

    const gitLabSettings = getGitLabSettings(settings);
    dataFetcher = gitLabSettings
        ? new GitLabFetcher(gitLabSettings.accessToken, gitLabSettings.hostName)
        : new GitHubFetcher(settings.githubAccessToken);

    if (!dataFetcher.isReady()) {
        console.warn('ACCESS TOKEN IS NOT SET');
        return;
    }

    const observer = new MutationObserver(watchCards);
    observer.observe(board, {
        childList: true,
        subtree: true,
    });

    document.querySelectorAll<HTMLElement>(columnsSelector).forEach((column) => {
        column.querySelectorAll<HTMLElement>(SELECTORS.card).forEach((card) => {
            void populateIssueCard(card);
        });
    });
}
