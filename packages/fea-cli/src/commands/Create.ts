import debug from 'debug';
import inquirer from 'inquirer';
import { Application } from '../lib/Application';
import { RC } from '../lib/RC';
import {
    CommandInstance,
    Command,
    Implements,
    CommandArgumentsType,
} from './type';
import { Git, GitBranchDescriptionType } from '../lib/Git';

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
        const { ticketIdPrefix } = await RC.getConfig();

        const answers: GitBranchDescriptionType = await inquirer.prompt([
            {
                message: 'What kind of ticket are you working on?',
                name: 'type',
                type: 'list',
                choices: [
                    {
                        name: 'feature (new feature for the user)',
                        value: 'feat',
                    },
                    {
                        name: 'fix (bug fix for the user)',
                        value: 'fix',
                    },
                    {
                        name: 'docs (changes to the documentation)',
                        value: 'docs',
                    },
                    {
                        name:
                            'style (code formatting, no production code change)',
                        value: 'style',
                    },
                    {
                        name: 'refactor (refactoring production code)',
                        value: 'refactor',
                    },
                    {
                        name: 'test (adding missing tests)',
                        value: 'test',
                    },
                    {
                        name: 'chore (updating repo infrastructure)',
                        value: 'chore',
                    },
                ],
                default: 'feat',
            },
            {
                message: 'What is the scope of this ticket (optional)?',
                name: 'scope',
            },
            {
                message: 'What does the ticket say?',
                name: 'title',
                validate: (value: string) => {
                    if (!value) {
                        return 'Must not be empty';
                    }

                    return true;
                },
            },
            {
                message: 'What is the ticket ID?',
                name: 'id',
                default: '',
            },
        ]);

        if (
            ticketIdPrefix &&
            answers.id.length &&
            !answers.id.startsWith(ticketIdPrefix)
        ) {
            answers.id = `${ticketIdPrefix}${answers.id}`;
        }

        d(answers);

        const branchName = Git.composeBranchName(answers);
        const branchDescription = JSON.stringify(answers);

        const git = new Git();

        await git.createBranch(branchName, branchDescription);
        await git.pushSetUpstream(branchName);

        d('Executed successfully');
    }
}
