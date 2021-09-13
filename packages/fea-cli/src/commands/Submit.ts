import debug from 'debug';
import { Application } from '../lib/Application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';
import { Git } from '../lib/Git';
import { getBranchOrFail, getRemoteOrFail } from '../lib/utils';
import { RC } from '../lib/RC';
import { GitHub } from '../lib/GitHub';
import { getTemplate } from '../lib/template';

const d = debug('submit');

@Implements<Command>()
export class Submit implements CommandInstance {
    static command = 'submit';
    static alias = 's';
    static description = `Submit the currently selected feature for reviewing`;
    static options: Command['options'] = [];

    constructor(
        private application: Application,
        private args: CommandArgumentsType,
        private options: CommandArgumentsType,
    ) {}

    async execute() {
        const git = new Git();

        const branch = await getBranchOrFail(git);
        const remoteInfo = await getRemoteOrFail(git);

        const { id } = branch.description!;

        const config = await RC.getConfig();

        const gitHub = new GitHub();
        let body = await getTemplate(gitHub, branch.description!);
        const options = {
            head: branch.name,
            ...remoteInfo,
            title: GitHub.composePRName(branch.description!),
            base: config.developmentBranch || undefined,
            draft: true, // todo: could be an option
            body,
        };

        d('POST /repos/{owner}/{repo}/pulls', options);

        const result = await gitHub.createPR(options);
        if (result.data.id) {
            d('Result', result.data);

            if (body.indexOf('#PR_NUMBER#') >= 0) {
                const prNumber = result.data.number;
                body = body.replace(/#PR_NUMBER#/g, prNumber.toString());
                // update the description
                await gitHub.updatePR(prNumber, {
                    ...remoteInfo,
                    body,
                });
            }

            // eslint-disable-next-line no-console
            console.log(`PR was created. Check out: ${result.data.html_url}`);
        }

        d('Executed successfully');
    }
}
