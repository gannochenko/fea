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
import { getFeatureList } from '../lib/getFeatureList';

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
        const featureList = await getFeatureList();

        // eslint-disable-next-line no-console
        console.log('Current features under development:\n');
        featureList.forEach((info) => {
            // eslint-disable-next-line no-console
            console.log(`   * ${info.name}`);
        });
        // eslint-disable-next-line no-console
        console.log('');

        d('Executed successfully');
    }
}
