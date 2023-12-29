export type GitLabSettings = {
    accessToken: string
    projectName: string
    hostName: string
}

export type Settings = {
    codeReviewersLabels: string
    ffCodeReviewers: boolean
    ffCompactReviewers: boolean
    ffShortName: boolean
    githubAccessToken: string
    hideClosedPRs: boolean
    hideLabelsOnClosedPRs: boolean
    prColumns: string
    gitlab: GitLabSettings[]
}

export type SettingsExtended = Omit<Settings, 'codeReviewersLabels' | 'prColumns'> & {
    codeReviewersLabels: string[]
    prColumns: string[]
}

export type SettingsChangeEvent<T = string> = {
    target: {
        type?: string,
        name: string,
        checked?: boolean,
        value: T
    }
}

export type RequestDetailsData = {
    id: string
    status: string
    repositoryName: string
    projectId: string
    url: string
};

export type LabelData = {
    name: string
    color: string
};

export type UserData = {
    avatar_url: string
    login: string
}

export type PullRequestDetailsData = {
    author: UserData
    requestedReviewers: UserData[]
    labels: LabelData[]
}

export type ReviewerData = UserData & {
    state: string
}

export interface DataFetcher {
    getRequestsList: (cardKey: string) => Promise<RequestDetailsData[]>
    getRequestDetails: (requestData: RequestDetailsData) => Promise<PullRequestDetailsData>
    getRequestReviewers: (requestData: RequestDetailsData, prData: PullRequestDetailsData) => Promise<ReviewerData[]>
    isReady: () => boolean;
}
