import {
    DataFetcher, LabelData, PullRequestDetailsData, RequestDetailsData, ReviewerData, UserData,
} from '@/types.ts';
import { fetchData, fetchJiraRest } from '@/utils/utils.ts';

type JiraCardData = {
    id: string
}

type JiraIssueDetailData = {
    detail?: {pullRequests?: RequestDetailsData[]}[]
}

type GitHubDetails = {
    user: UserData
    requested_reviewers: UserData[]
    labels: LabelData[]
}

type GitHubReview = {
    user: UserData
    state: string
}

export default class GitHubFetcher implements DataFetcher {
    private readonly accessToken: string = '';

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    isReady() {
        return !!this.accessToken;
    }

    private getHeaders() {
        return new Headers({
            Authorization: `token ${this.accessToken}`,
        });
    }

    async getRequestsList(cardKey: string): Promise<RequestDetailsData[]> {
        const { id } = await fetchJiraRest<JiraCardData>(`/api/3/issue/${cardKey}?fields=id`);
        const { detail } = await fetchJiraRest<JiraIssueDetailData>(
            `/dev-status/latest/issue/detail?issueId=${id}&applicationType=GitHub&dataType=pullrequest`,
        );

        return detail?.[0]?.pullRequests?.map((item) => ({
            ...item,
            id: item.id.replace('#', ''),
        })) || [];
    }

    async getRequestDetails(requestData: RequestDetailsData): Promise<PullRequestDetailsData> {
        const data = await fetchData<GitHubDetails>(
            `https://api.github.com/repos/${requestData.repositoryName}/pulls/${requestData.id}`,
            { headers: this.getHeaders() },
        );

        return {
            author: data.user,
            requestedReviewers: data.requested_reviewers,
            labels: data.labels.map((label) => ({ ...label, color: `#${label.color}` })),
        };
    }

    async getRequestReviewers(requestData:RequestDetailsData, prData: PullRequestDetailsData): Promise<ReviewerData[]> {
        const reviews = await fetchData<GitHubReview[]>(
            `https://api.github.com/repos/${requestData.repositoryName}/pulls/${requestData.id}/reviews?per_page=100`,
            { headers: this.getHeaders() },
        );

        const { author, requestedReviewers } = prData;
        const reviewers: Record<string, ReviewerData> = {
            ...requestedReviewers.reduce((prev, user) => ({ ...prev, [user.login]: { state: 'PENDING', ...user } }), {}),
            ...reviews.reduce((prev, { user, state }) => ({ ...prev, [user.login]: { state, ...user } }), {}),
        };

        return Object.values(reviewers).filter((reviewer) => reviewer.login !== author.login);
    }
}
