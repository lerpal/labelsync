import {
    DataFetcher, PullRequestDetailsData, RequestDetailsData, ReviewerData, UserData,
} from '@/types.ts';
import { fetchData } from '@/utils/utils.ts';

const APPROVED_NOTE: string = 'approved this merge request';

enum ReviewState {
  APPROVED = 'APPROVED',
  COMMENTED = 'COMMENTED',
  RESET = 'RESET',
  SYSTEM = 'SYSTEM',
}

type GitLabUser = {
    avatar_url: string
    username: string
}

type GitLabMergeRequest = {
    id: number
    project_id: number
    state: string
    web_url: string
    references: {
        full: string
        short: string
    }
    author: GitLabUser
    reviewers: GitLabUser[]
    labels: string[]
}

type GitLabNote = {
    body: string
    resolvable: boolean
    resolved: boolean
    author: GitLabUser
}

export default class GitLabFetcher implements DataFetcher {
    private readonly accessToken: string = '';

    private readonly hostname: string = '';

    private readonly cache: Record<string, GitLabMergeRequest> = {};

    constructor(accessToken: string, hostname: string) {
        this.accessToken = accessToken;
        this.hostname = hostname;
    }

    isReady() {
        return !!this.accessToken && !!this.hostname;
    }

    private getHeaders() {
        return new Headers({
            Authorization: `Bearer ${this.accessToken}`,
        });
    }

    private getUser(user: GitLabUser): UserData {
        return {
            avatar_url: user.avatar_url,
            login: user.username,
        };
    }

    async fetchApi<T>(path: string) {
        return fetchData<T>(
            `https://${this.hostname}/api/v4${path}`,
            { headers: this.getHeaders() },
        );
    }

    async getRequestsList(cardKey: string): Promise<RequestDetailsData[]> {
        const data = await this.fetchApi<GitLabMergeRequest[]>(
            `/merge_requests?search=${cardKey}&in=title&scope=all`,
        );

        return data.map((item) => {
            const id = item.references.short.replace('!', '');
            this.cache[id] = item;
            return {
                id,
                projectId: `${item.project_id}`,
                status: item.state,
                repositoryName: item.references.full.replace(item.references.short, ''),
                url: item.web_url,
            };
        });
    }

    async getRequestDetails(requestData: RequestDetailsData): Promise<PullRequestDetailsData> {
        const data = this.cache[requestData.id];

        return {
            author: this.getUser(data.author),
            requestedReviewers: data.reviewers.map(this.getUser),
            labels: data.labels.map((label) => ({ name: label, color: '#555555' })),
        };
    }

    getNoteState(note: GitLabNote): ReviewState {
        if (note.body === APPROVED_NOTE) {
            return ReviewState.APPROVED;
        }

        if (note.body.match(/added \d+ commit/)) {
            return ReviewState.RESET;
        }

        if (!note.resolvable) {
            return ReviewState.SYSTEM;
        }

        return ReviewState.COMMENTED;
    }

    async getRequestReviewers(requestData: RequestDetailsData, prData: PullRequestDetailsData): Promise<ReviewerData[]> {
        const notes = await this.fetchApi<GitLabNote[]>(
            `/projects/${requestData.projectId}/merge_requests/${requestData.id}/notes`,
        );

        const reviewers: Record<string, ReviewerData> = notes.reverse().reduce((prev, item) => {
            const state = this.getNoteState(item);
            switch (state) {
            case ReviewState.RESET:
                return {};
            case ReviewState.SYSTEM:
                return prev;

            case ReviewState.COMMENTED:
            case ReviewState.APPROVED:
                return {
                    ...prev,
                    [item.author.username]: {
                        ...this.getUser(item.author),
                        state,
                    },
                };
            default:
                return prev;
            }
        }, {});

        return Object.values(reviewers).filter((reviewer) => reviewer.login !== prData.author.login);
    }
}
