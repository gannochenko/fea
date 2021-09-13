import debug from 'debug';
import inquirer, { ChoiceOptions } from 'inquirer';
import { Application } from '../lib/Application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';
import { RC } from '../lib/RC';
import { Git } from '../lib/Git';
import { getBranchOrFail } from '../lib/utils';

const d = debug('checkout');

@Implements<Command>()
export class Checkout implements CommandInstance {
    static command = 'checkout';
    static alias = 'c';
    static description = '';
    static options: Command['options'] = [];

    constructor(
        private application: Application,
        private args: CommandArgumentsType,
        private options: CommandArgumentsType,
    ) {}

    async execute() {
        const git = new Git();

        const branch = await getBranchOrFail(git);

        const config = await RC.getConfig();

        const { developmentBranch, releaseBranch } = config;

        const list = await git.getBranches();
        const result: ChoiceOptions[] = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const branchItem of list) {
            if (
                branchItem !== developmentBranch &&
                branchItem !== releaseBranch
            ) {
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const info = await git.getBranchInfo(branchItem);
                    if (info && info.description) {
                        result.push({
                            name: `${Git.composeCommitMessage(
                                info.description,
                                undefined,
                            )} (${info.name})`,
                            value: branchItem,
                        });
                    }
                } catch (e) {}
            }
        }

        const answers = (await inquirer.prompt([
            {
                message: 'Switch to the feature:',
                name: 'branchName',
                type: 'list',
                choices: result,
                // default: '',
            },
        ])) as { branchName: string };

        const { branchName } = answers;
        if (branchName) {
            if (await git.hasIndexedChanges()) {
                await git.stashWithMessage(`stash:${branch.name}:stash`);
            }

            await git.checkout(branchName);

            const stashId = await git.getStashIdByMessage(
                `stash:${branchName}:stash`,
            );
            if (stashId && stashId.length) {
                await git.stashApplyById(stashId);
                await git.stashDropById(stashId);
            }
        }

        d('Executed successfully');
    }
}
