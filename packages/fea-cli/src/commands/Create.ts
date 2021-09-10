import debug from 'debug';
import { Application } from '../lib/application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';

const d = debug('create');

@Implements<Command>()
export class Create implements CommandInstance {
    static command = 'create';
    static alias = 'c';
    static description = `Create a feature`;
    static options: Command['options'] = [
        // ['-o, --output <path>', 'Output file'],
    ];

    constructor(
        private application: Application,
        private args: CommandArgumentsType,
        private options: CommandArgumentsType,
    ) {}

    async execute() {
        d('Executed successfully');
    }
}
