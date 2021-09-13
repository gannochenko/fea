import debug from 'debug';
import { Application } from '../lib/Application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';

const d = debug('feature');

const ACTION_CHECKOUT = 'checkout';
const ACTION_SUBMIT = 'submit';
const ACTION_MERGE = 'merge';
const ACTION_INFO = 'info';

@Implements<Command>()
export class Feature implements CommandInstance {
    static command = 'feature [action]';
    static alias = 'f';
    static description = `Do operations with inactive branches. The [action] argument may be one of:
    * ${ACTION_CHECKOUT} - select a feature and make it current
    * ${ACTION_SUBMIT} - select a feature and submit for reviewing
    * ${ACTION_MERGE} - select a feature and merge into the development branch
    * ${ACTION_INFO} - select a feature and display information`;
    static options: Command['options'] = [];

    constructor(
        private application: Application,
        private args: CommandArgumentsType,
        private options: CommandArgumentsType,
    ) {}

    async execute() {
        d('Executed successfully');
    }
}
