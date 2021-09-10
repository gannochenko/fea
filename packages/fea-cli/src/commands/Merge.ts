import debug from 'debug';
import { Application } from '../lib/application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';

const d = debug('merge');

@Implements<Command>()
export class Merge implements CommandInstance {
    static command = 'merge';
    static alias = 'm';
    static description = `Merge the currently active feature into the development branch`;
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
