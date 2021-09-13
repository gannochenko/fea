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
import { submitFeature } from '../lib/submitFeature';

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

        await submitFeature(git, branch);

        d('Executed successfully');
    }
}
