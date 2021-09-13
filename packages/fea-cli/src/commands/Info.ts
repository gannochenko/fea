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

const d = debug('info');

@Implements<Command>()
export class Info implements CommandInstance {
    static command = 'info';
    static alias = 'i';
    static description = `Display information about the currently active feature`;
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

        const config = await RC.getConfig();

        const formatTicket = (ticketId: string) => {
            if (config.ticketViewURLTemplate) {
                return config.ticketViewURLTemplate.replace(
                    '#TICKET_ID#',
                    ticketId,
                );
            }

            return ticketId;
        };

        // eslint-disable-next-line no-console
        console.log(`Feature info:

    Branch: ${branch.name}
    Ticket: ${formatTicket(branch.description!.id)}`);

        d('Remote info', remoteInfo);

        if (!remoteInfo) {
            return;
        }

        const github = new GitHub();
        const pr = await github.getPRByBranch(
            branch.name,
            config.developmentBranch,
            remoteInfo,
        );

        const getPRStatus = () => {
            const result: string[] = [];

            if (pr) {
                if (pr.state === 'open') {
                    result.push('open');
                }

                if (pr.draft) {
                    result.push('draft');
                }

                if (pr.mergeable_state === 'unstable') {
                    result.push('checking');
                }

                if (pr.mergeable_state === 'clean') {
                    result.push('ready');
                }

                if (pr.mergeable_state === 'blocked') {
                    result.push('blocked');
                }
            }

            return result.join(', ');
        };

        if (!pr) {
            // eslint-disable-next-line no-console
            console.log(`
No Pull Request info available. The feature is not yet submitted or was already merged.`);
            return;
        }

        // eslint-disable-next-line no-console
        console.log(`    PR:     ${pr.html_url}
    Status: ${getPRStatus()}
`);

        d('Executed successfully');
    }
}
