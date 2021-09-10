// import clear from 'clear';
import commander, { Argument, Command as CommanderCommand } from 'commander';
import process from 'process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { commands } from '../commands';

const getFileAccessError = promisify(fs.access);
const readFile = promisify(fs.readFile);

export class Application {
    private introShown = false;

    public async run() {
        await this.showIntro();
        await this.processCLI();
    }

    public async showIntro() {
        if (this.introShown) {
            return;
        }

        // clear();

        this.introShown = true;
    }

    private async processCLI() {
        const program = new commander.Command();

        program
            .name('fea')
            .version(
                await this.getVersion(),
                '-v, --version',
                'output the current version',
            )
            .description("Fea\n\n*** Powered by git and GitHub API ***")
            .on('--help', () => {
                console.log(`
✉️  Contact author: https://www.linkedin.com/in/gannochenko/
🐞 Submit issue or request feature: https://github.com/gannochenko/fea-cli/issues
`);
            });

        commands.forEach(CommandClass => {
            const { command, alias, description, options } = CommandClass;
            const commandDeclaration = program
                .command(command)
                .alias(alias)
                .description(description);

            if (options) {
                options.forEach(option => {
                    commandDeclaration.option(option[0], option[1]);
                });
            }

            commandDeclaration.action(async (...args) =>
                    // something: string,
                    // anything: string,
                    // commanderCommand: CommanderCommand,
                {
                    const currentCommand: CommanderCommand = args.pop();

                    let callOptions: Record<string, string> = {};
                    if (args.length) {
                        callOptions = args.pop();
                    }

                    const argsValues: Record<string, string> = {};

                    // @ts-ignore
                    // eslint-disable-next-line no-underscore-dangle
                    const commandArguments = currentCommand._args as Argument[];
                    commandArguments.forEach(argument => {
                        argsValues[argument.name()] = args.shift();
                    });

                    const instance = new CommandClass(
                        this,
                        argsValues,
                        callOptions,
                    );
                    await instance.execute();
                },
            );
        });

        await program.parse(process.argv);
    }

    private async getVersion(): Promise<string> {
        const UNKNOWN_VERSION = '0.0.0';

        const packagePath = path.normalize(
            path.join(__dirname, '../../package.json'),
        );
        const accessError = await getFileAccessError(packagePath);
        // @ts-ignore
        if (accessError) {
            return UNKNOWN_VERSION;
        }

        try {
            const packageData = JSON.parse(
                (await readFile(packagePath)).toString('utf8'),
            );
            return packageData.version || UNKNOWN_VERSION;
        } catch (error) {}

        return UNKNOWN_VERSION;
    }
}
