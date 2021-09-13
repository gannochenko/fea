import { Octokit } from '@octokit/core';
import debug from 'debug';
import { GitBranchDescriptionType } from './Git';

type GitHubRemoteInfoType = {
    owner: string;
    repo: string;
};

type GitHubPRType = GitHubRemoteInfoType & {
    title: string;
    body?: string;
    head: string;
    base?: string;
    draft?: boolean;
    id?: string;
};

type GitHubUpdatePRType = Omit<Partial<GitHubPRType>, 'id' | 'base' | 'head'>;

type GitHubPRListType = {
    owner: string;
    repo: string;
    head: string;
    base?: string;
};

type GitHubMergePRType = GitHubRemoteInfoType & {
    // eslint-disable-next-line camelcase
    pull_number: number;
    // eslint-disable-next-line camelcase
    commit_title: string;
    // eslint-disable-next-line camelcase
    merge_method?: 'squash' | 'merge' | 'rebase';
};

const d = debug('GitHub');

export class GitHub {
    private octokit?: Octokit;

    public static composePRName(description: GitBranchDescriptionType) {
        let result = `${description.type}${
            description.scope ? `(${description.scope})` : ''
        }: ${description.title}`;

        if (description.id.length) {
            result = `${result} [${description.id}]`;
        }

        return result;
    }

    // https://docs.github.com/en/rest/reference/pulls
    public async createPR(options: GitHubPRType) {
        return this.getOctokit().request('POST /repos/{owner}/{repo}/pulls', {
            base: 'master',
            draft: false,
            ...options,
        });
    }

    // https://docs.github.com/en/rest/reference/pulls#update-a-pull-request
    public async updatePR(number: number, options: GitHubUpdatePRType) {
        return this.getOctokit().request(
            'POST /repos/{owner}/{repo}/pulls/{pull_number}',
            {
                pull_number: number,
                ...options,
            },
        );
    }

    public async getPRByBranch(
        headBranch: string,
        baseBranch: string,
        remoteInfo: GitHubRemoteInfoType,
    ) {
        const list = await this.getPRList({
            ...remoteInfo,
            base: baseBranch,
            head: headBranch,
        });

        if (!(list && list.data && list.data.length)) {
            return null;
        }

        const pr = list.data.find(
            (request: any) => request.head.ref === headBranch,
        );

        if (!pr) {
            return null;
        }

        const detailedPR = await this.getPR(pr.number, remoteInfo);

        if (!(detailedPR && detailedPR.data)) {
            return null;
        }

        return detailedPR.data;
    }

    public async getPRList(options: GitHubPRListType) {
        const requestOptions = {
            // base: 'master',
            ...options,
            // state: 'open',
            // draft: false,
            accept: 'Setting to application/vnd.github.v3+json',
        };

        d('Get pull requests', requestOptions);

        return this.getOctokit().request(
            'GET /repos/{owner}/{repo}/pulls',
            requestOptions,
        );
    }

    public async getPR(number: number, options: GitHubRemoteInfoType) {
        const { owner, repo } = options;
        return this.getOctokit().request(
            'GET /repos/{owner}/{repo}/pulls/{pull_number}',
            {
                owner,
                repo,
                pull_number: number,
            },
        );
    }

    public async mergePR(options: GitHubMergePRType) {
        return this.getOctokit().request(
            'PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge',
            {
                merge_method: 'squash',
                ...options,
            },
        );
    }

    private getOctokit() {
        if (!this.octokit) {
            this.octokit = new Octokit({
                auth: process.env.GBELT_GITHUB_TOKEN,
            });
        }

        return this.octokit;
    }
}
