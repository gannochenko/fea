import debug from 'debug';
import { Application } from '../lib/application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';

const d = debug('checkout');

@Implements<Command>()
export class Checkout implements CommandInstance {
    static command = 'checkout';
    static alias = 'ch';
    static description = `Select another feature from the list`;
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
