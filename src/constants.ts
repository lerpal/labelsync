import { Settings } from '@/types.ts';

export const INITIAL_SETTINGS: Settings = {
    codeReviewersLabels: 'In Code Review, Ready for Code Review',
    githubAccessToken: '',
    gitlab: [{
        accessToken: '',
        projectName: '',
        hostName: '',
    }],
    hideLabelsOnClosedPRs: true,
    hideClosedPRs: false,
    prColumns: 'In Review, Done',
    ffCodeReviewers: false,
    ffShortName: true,
    ffCompactReviewers: true,
};

export const SELECTORS = {
    board: '[data-test-id="software-board.board-area"]',
    column: '[data-component-selector="platform-board-kit.ui.column.draggable-column"]',
    columnHeader: '[data-component-selector="platform-board-kit.ui.column-title"]',
    card: '[data-component-selector="platform-board-kit.ui.card-container"]',
    labelsContainer: 'div[class*="_content"] > div:last-child',
} as const;
