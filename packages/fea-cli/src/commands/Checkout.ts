import debug from 'debug';
import inquirer from 'inquirer';
import { Application } from '../lib/Application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';
import { Git } from '../lib/Git';
import { getBranchOrFail } from '../lib/utils';
import { getFeatureList } from '../lib/getFeatureList';

const d = debug('Checkout');

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

        const featureList = await getFeatureList();

        const answers = (await inquirer.prompt([
            {
                message: 'Switch to the feature:',
                name: 'branchName',
                type: 'list',
                choices: featureList,
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
