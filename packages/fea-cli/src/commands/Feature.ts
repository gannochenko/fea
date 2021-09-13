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
import { RC } from '../lib/RC';
import { getRemoteOrFail } from '../lib/utils';
import { GitHub } from '../lib/GitHub';
import { getFeatureList } from '../lib/getFeatureList';
import { submitFeature } from '../lib/submitFeature';
import { mergeFeature } from '../lib/mergeFeature';

const d = debug('feature');

const ACTION_SUBMIT = 'submit';
const ACTION_MERGE = 'merge';

@Implements<Command>()
export class Feature implements CommandInstance {
    static command = 'feature [action]';
    static alias = 'f';
    static description = `Do operations with inactive branches. The [action] argument may be one of:
    * ${ACTION_SUBMIT} - select a feature and submit for reviewing
    * ${ACTION_MERGE} - select a feature and merge into the development branch`;
    static options: Command['options'] = [];

    constructor(
        private application: Application,
        private args: CommandArgumentsType,
        private options: CommandArgumentsType,
    ) {}

    async execute() {
        const { action } = this.args;

        if ([ACTION_SUBMIT, ACTION_MERGE].indexOf(action) < 0) {
            throw new Error(`Unknown action: ${action}`);
        }

        const git = new Git();

        const featureList = await getFeatureList();

        const answers = (await inquirer.prompt([
            {
                message: `Select a feature to ${action}`,
                name: 'branchName',
                type: 'list',
                choices: featureList,
                // default: '',
            },
        ])) as { branchName: string };

        const { branchName } = answers;
        if (branchName) {
            const branch = await git.getBranchInfo(branchName);

            if (action === ACTION_SUBMIT) {
                await submitFeature(git, branch);
            }

            if (action === ACTION_MERGE) {
                await mergeFeature(git, branch, { doCheckoutToDev: false });
            }
        }

        const github = new GitHub();

        d('Executed successfully');
    }
}
