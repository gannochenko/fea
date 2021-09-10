import debug from 'debug';
import { Application } from '../lib/application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';

const d = debug('info');

@Implements<Command>()
export class Info implements CommandInstance {
    static command = 'info';
    static alias = 'i';
    static description = `Display information about the currently active feature`;
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
