import debug from 'debug';
import { Application } from '../lib/Application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';

const d = debug('release');

const ACTION_CREATE = 'create';
const ACTION_MERGE = 'merge';

@Implements<Command>()
export class Release implements CommandInstance {
    static command = 'release [action]';
    static alias = 'r';
    static description = '';
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
