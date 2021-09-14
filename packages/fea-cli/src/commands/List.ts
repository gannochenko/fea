import debug from 'debug';
import { Application } from '../lib/Application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';
import { getFeatureList } from '../lib/getFeatureList';

const d = debug('list');

@Implements<Command>()
export class List implements CommandInstance {
    static command = 'list';
    static alias = 'l';
    static description = 'Display a list of features';
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
