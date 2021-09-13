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

const d = debug('list');

@Implements<Command>()
export class List implements CommandInstance {
    static command = 'list';
    static alias = 'l';
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

        // eslint-disable-next-line no-console
        console.log('Current features under development:\n');
        result.forEach((info) => {
            // eslint-disable-next-line no-console
            console.log(`   * ${info.name}`);
        });
        // eslint-disable-next-line no-console
        console.log('');

        d('Executed successfully');
    }
}
