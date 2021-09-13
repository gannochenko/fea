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
import { getBranchOrFail, getRemoteOrFail } from '../lib/utils';
import { RC } from '../lib/RC';
import { GitHub } from '../lib/GitHub';
import { mergeFeature } from '../lib/mergeFeature';

const d = debug('merge');

@Implements<Command>()
export class Merge implements CommandInstance {
    static command = 'merge';
    static alias = 'm';
    static description = `Merge the currently active feature into the development branch`;
    static options: Command['options'] = [];

    constructor(
        private application: Application,
        private args: CommandArgumentsType,
        private options: CommandArgumentsType,
    ) {}

    async execute() {
        const git = new Git();
        const branch = await getBranchOrFail(git);

        await mergeFeature(git, branch, { doCheckoutToDev: true });

        d('Executed successfully');
    }
}
