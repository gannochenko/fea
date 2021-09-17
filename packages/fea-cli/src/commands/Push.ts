import debug from 'debug';
import { Application } from '../lib/Application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';
import { Git } from '../lib/Git';
import { getBranchOrFail } from '../lib/utils';

const d = debug('push');

@Implements<Command>()
export class Push implements CommandInstance {
    static command = 'push [message]';
    static alias = 'p';
    static description =
        'Pushes the current changes to the current feature branch';
    static options: Command['options'] = [];

    constructor(
        private application: Application,
        private args: CommandArgumentsType,
        private options: CommandArgumentsType,
    ) {}

    async execute() {
        const git = new Git();
        const { name } = await getBranchOrFail(git);

        const message = this.args.message ?? 'work in progress';

        await git.commit(message);
        await git.push(name);

        d('Executed successfully');
    }
}
