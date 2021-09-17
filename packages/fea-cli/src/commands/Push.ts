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
    static command = 'push';
    static alias = 'p';
    static description = `Merge the currently active feature into the development branch`;
    static options: Command['options'] = [];

    constructor(
        private application: Application,
        private args: CommandArgumentsType,
        private options: CommandArgumentsType,
    ) {}

    async execute() {
        const git = new Git();
        const { name } = await getBranchOrFail(git);

        await git.commit('work in progress');
        await git.push(name);

        d('Executed successfully');
    }
}
