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

        const config = await RC.getConfig();
        d('Config', config);

        const { developmentBranch, releaseBranch } = config;

        const list = await git.getBranches();
        const result: ChoiceOptions[] = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const branch of list) {
            if (branch !== developmentBranch && branch !== releaseBranch) {
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const info = await git.getBranchInfo(branch);
                    if (info && info.description) {
                        result.push({
                            name: `${Git.composeCommitMessage(
                                info.description,
                                undefined,
                            )} (${info.name})`,
                            value: branch,
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
            await git.checkout(branchName);
        }

        // console.log(list);
        // const branch = await getBranchOrThrow();
        // d('Branch info', branch);
        //
        // if (!(await GIT.hasStage())) {
        //     console.log('No changes to commit.');
        //     return;
        // }
        //
        // await GIT.commit('Work in progress');

        d('Executed successfully');
    }
}
