import debug from 'debug';
import { Application } from '../lib/Application';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';

const d = debug('feature');

const ACTION_CREATE = 'create';
const ACTION_SUBMIT = 'submit';
const ACTION_MERGE = 'merge';
const ACTION_INFO = 'info';

@Implements<Command>()
export class Feature implements CommandInstance {
    static command = 'feature [action] [id]';
    static alias = 'f';
    static description = `Create, submit and merge a feature. [action] may be one of:

    * ${ACTION_CREATE} - create a local feature branch
    * ${ACTION_SUBMIT} - create a feature PR based on the current feature branch
    * ${ACTION_MERGE} - merge the feature PR that matches the current feature branch
    * ${ACTION_INFO} - get information about the current feature
`;
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
