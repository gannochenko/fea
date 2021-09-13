import debug from 'debug';
import inquirer from 'inquirer';
import { Application } from '../lib/Application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';
import { RC } from '../lib/RC';
import { getRemoteOrFail } from '../lib/utils';
import { Git } from '../lib/Git';
import { GitHub } from '../lib/GitHub';

const d = debug('release');

const ACTION_CREATE = 'create';
const ACTION_MERGE = 'merge';

@Implements<Command>()
export class Release implements CommandInstance {
    static command = 'release [action]';
    static alias = 'r';
    static description = `Create and merge a release. The [action] may be one of:
    * ${ACTION_CREATE} - create a release PR
    * ${ACTION_MERGE} - merge the currently open release PR
`;
    static options: Command['options'] = [];

    constructor(
        private application: Application,
        private args: CommandArgumentsType,
        private options: CommandArgumentsType,
    ) {}

    async execute() {
        const { action } = this.args;

        if (action !== ACTION_CREATE && action !== ACTION_MERGE) {
            throw new Error(`Unknown action: ${action}`);
        }

        const git = new Git();
        const config = await RC.getConfig();

        if (config.releaseBranch === config.developmentBranch) {
            console.error(
                'You have your release branch equal to the development branch. Not much I can do here.',
            );
            return;
        }

        const remoteInfo = await getRemoteOrFail(git);

        const github = new GitHub();

        const prList = (
            await github.getPRList({
                ...remoteInfo,
                base: config.releaseBranch,
                head: config.developmentBranch || 'dev',
            })
        ).data;

        d('PR list', prList);

        if (action === ACTION_CREATE) {
            if (prList.length) {
                console.error(
                    `A release PR already exists: ${prList[0].html_url}`,
                );
                return;
            }

            const result = await github.createPR({
                ...remoteInfo,
                title: config.releasePRName,
                base: config.releaseBranch,
                head: config.developmentBranch,
            });
            if (result.data.id) {
                d('Result', result.data);
                // eslint-disable-next-line no-console
                console.log(
                    `The release PR was created. Check out: ${result.data.html_url}`,
                );
            }
        }

        if (action === ACTION_MERGE) {
            if (!prList.length) {
                console.error(
                    `You don't have any release PR created. Create one with 'gbelt release ${ACTION_CREATE}'.`,
                );
                return;
            }

            const [pr] = prList;

            // eslint-disable-next-line no-console
            console.log(
                'You are about to merge something into the release branch. If you have the Continuous Delivery set up, it will most likely trigger the production deployment.',
            );
            // eslint-disable-next-line no-console
            console.log(
                `You might want to look at your PR again: ${pr.html_url}`,
            );
            const answers = (await inquirer.prompt([
                {
                    message: 'Proceed?',
                    name: 'proceed',
                    type: 'confirm',
                    default: false,
                },
            ])) as { proceed: boolean };

            const { proceed } = answers;

            if (proceed) {
                // eslint-disable-next-line no-console
                console.log('Rock-n-roll!');
                const result = await github.mergePR({
                    ...remoteInfo,
                    pull_number: pr.number,
                    commit_title: `Release! (#${pr.number})`,
                    merge_method: 'merge',
                });

                if (result.status === 200) {
                    // eslint-disable-next-line no-console
                    console.log(
                        `The release PR #${pr.number} was successfully merged.`,
                    );
                }
            } else {
                // eslint-disable-next-line no-console
                console.log('Smart choice.');
            }
        }

        d('Executed successfully');
    }
}
