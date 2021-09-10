import execa from 'execa';
import { isCommandAvailable, sanitizeString } from './utils';

export type GitBranchDescriptionType = {
    title: string;
    type: string;
    id: string;
    scope?: string;
    // [k: string]: unknown;
};

export class Git {
    private isGitAvailable?: boolean;

    static composeBranchName(description: GitBranchDescriptionType) {
        let result = `${description.type}/${sanitizeString(description.title)}`;
        if (description.id.length) {
            result = `${result}-${sanitizeString(description.id)}`;
        }

        return result;
    }

    constructor(private repositoryPath: string = process.cwd()) {}

    public async createBranch(
        branch: string,
        description?: string,
        path?: string,
    ) {
        await this.maybeFail();
        await this.execute(['checkout', '-b', branch]);
        if (description) {
            await this.execute(['config', `branch.${branch}.description`, description]);
        }
    }

    public async pushSetUpstream(branch: string, path?: string) {
        await this.maybeFail();
        await this.execute(['push', '--set-upstream', 'origin', branch]);
    }

    private async isAvailable() {
        if (this.isGitAvailable === undefined) {
            this.isGitAvailable = await isCommandAvailable('git -h');
        }

        return this.isGitAvailable;
    }

    private async execute(args: string[]) {
        const result = await execa('git', args, {
            cwd: this.repositoryPath,
            stdio: ['ignore', 'ignore', 'ignore'],
        });

        console.log(result);
    }

    private async maybeFail() {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }
    }
}
