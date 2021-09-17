import execa from 'execa';
import debug from 'debug';
import { isCommandAvailable, sanitizeString } from './utils';

export type GitBranchDescriptionType = {
    title: string;
    type: string;
    id: string;
    scope?: string;
};

export type GitBranchType = {
    name: string;
    description?: GitBranchDescriptionType;
};

const d = debug('Git');

export class Git {
    private isGitAvailable?: boolean;

    public static composeBranchName(description: GitBranchDescriptionType) {
        let result = `${description.type}/${sanitizeString(description.title)}`;
        if (description.id.length) {
            result = `${result}-${sanitizeString(description.id)}`;
        }

        return result;
    }

    public static composeCommitMessage(
        description: GitBranchDescriptionType,
        prNumber?: number,
    ) {
        let result = `${description.type}${
            description.scope ? `(${description.scope})` : ''
        }: ${description.title}`;

        if (description.id.length) {
            result = `${result} [${description.id}]`;
        }

        return result;

        return `${result}${prNumber ? ` (#${prNumber})` : ''}`;
    }

    constructor(private repositoryPath: string = process.cwd()) {}

    public async createBranch(branch: string, description?: string) {
        await this.ensureAvailableOrFail();
        await this.execute(['checkout', '-b', branch]);
        if (description) {
            await this.execute([
                'config',
                `branch.${branch}.description`,
                description,
            ]);
        }
    }

    public async getCurrentBranch(): Promise<GitBranchType | null> {
        await this.ensureAvailableOrFail();

        const result = await this.execute(['branch']);

        const current = result.stdout.match(/\*\s+(.+)/m);
        if (!current || !current[1]) {
            d('No current branch detected');
            return null;
        }

        const name = current[1];

        return this.getBranchInfo(name);
    }

    public async push(branch: string) {
        await this.ensureAvailableOrFail();
        await this.execute(['push', 'origin', branch]);
    }

    public async pushSetUpstream(branch: string) {
        await this.ensureAvailableOrFail();
        await this.execute(['push', '--set-upstream', 'origin', branch]);
    }

    public async getBranchInfo(branchName: string) {
        await this.ensureAvailableOrFail();

        const result = await this.execute([
            'config',
            `branch.${branchName}.description`,
        ]);

        const info: GitBranchType = {
            name: branchName,
        };

        try {
            info.description = JSON.parse(
                result.stdout,
            ) as GitBranchDescriptionType;
        } catch (e) {
            d('Was not able to parse the JSON of branch data');
            return info;
        }

        return info;
    }

    public async getRemoteInfo(which = 'origin') {
        await this.ensureAvailableOrFail();

        const result = await this.execute(['remote', `get-url`, which]);

        const urlMatch = result.stdout
            .trim()
            .match(/git@github\.com:(.+)\/(.+)\.git/);
        if (!urlMatch) {
            d('No remote info available');
            return null;
        }

        const [, owner, repo] = urlMatch;

        return {
            owner,
            repo,
        };
    }

    public async checkout(branch: string) {
        await this.ensureAvailableOrFail();
        await this.execute(['checkout', branch]);
    }

    public async deleteBranch(branch: string) {
        await this.ensureAvailableOrFail();
        await this.execute(['branch', '-D', branch]);
    }

    public async pull(branch: string, remote = 'origin') {
        await this.ensureAvailableOrFail();
        await this.execute(['pull', remote, branch]);
    }

    public async getBranches() {
        await this.ensureAvailableOrFail();
        const { stdout } = await this.execute([
            'show-branch',
            '--no-color',
            '--list',
        ]);

        let matches = stdout.match(/\[([^\[\]]+)\]/gm);
        if (matches) {
            matches = matches.map((match) =>
                match.replace('[', '').replace(']', ''),
            );
        }

        return matches || [];
    }

    public async hasIndexedChanges() {
        await this.ensureAvailableOrFail();
        const { stdout } = await this.execute(['status']);
        return stdout.indexOf('Changes to be committed') >= 0;
    }

    public async stashWithMessage(message: string) {
        await this.ensureAvailableOrFail();
        await this.execute(['stash', 'push', '-m', `${message}`]);
    }

    public async getStashIdByMessage(message: string): Promise<string | null> {
        await this.ensureAvailableOrFail();
        const { stdout } = await this.execute(['stash', 'list']);

        const result = stdout.match(
            new RegExp(`stash@{(\\d+)}: On .+: ${message}`, 'g'),
        );
        if (result && result[0]) {
            const resultNext = result[0].match(/stash@{(\d+)}/);
            return resultNext && resultNext[1] ? resultNext[1] : null;
        }

        return null;
    }

    public async stashApplyById(id: string) {
        await this.ensureAvailableOrFail();
        await this.execute(['stash', 'apply', id]);
    }

    public async stashDropById(id: string) {
        await this.ensureAvailableOrFail();
        await this.execute(['stash', 'drop', id]);
    }

    public async commit(message: string) {
        await this.ensureAvailableOrFail();
        await this.execute(['commit', '-am', message]);
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
            stdio: ['inherit', 'pipe', 'pipe'],
        });

        d(`Executing: git ${args.join(' ')}`);

        if (result.failed || result.exitCode) {
            d('Command execution failed');
            d(result.stderr);
            throw new Error(`Command failed: git ${args.join(' ')}`);
        } else {
            d('Command execution successful');
            d(result.stdout);
            d(result.stderr);
        }

        return result;
    }

    private async ensureAvailableOrFail() {
        if (!(await this.isAvailable())) {
            throw new Error('Git is not available');
        }
    }
}
